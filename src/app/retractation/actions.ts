"use server";

import { createHash } from "node:crypto";

import { headers } from "next/headers";
import { z } from "zod";

import { withdrawalDays } from "@/config/legal";
import { withdrawalAckEmail } from "@/lib/commerce/emails";
import { normalizeOrderReference } from "@/lib/commerce/format";
import { sellerSnapshot } from "@/lib/commerce/seller";
import { emailProvider } from "@/lib/services/email";
import { paymentProvider } from "@/lib/services/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export type Eligibility = "eligible" | "waived" | "period_over" | "already_withdrawn" | "not_paid";

export type WithdrawalState =
  | {
      step: "identify";
      message?: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string>;
    }
  | {
      step: "confirm";
      values: { reference: string; email: string; name: string };
      order: {
        reference: string;
        titles: string[];
        paidAt: string;
        deadline: string;
        amountCents: number;
        eligibility: Eligibility;
      };
      message?: string;
    }
  | { step: "done"; reference: string; requestedAt: string; email: string; emailSent: boolean };

const identifySchema = z.object({
  name: z.string().trim().min(1, "Indiquez votre nom.").max(120, "120 caractères maximum."),
  email: z.email("Indiquez l’adresse e-mail utilisée pour la commande.").max(320),
  reference: z
    .string()
    .transform((v) => normalizeOrderReference(v))
    .refine((v) => v !== null, "Le numéro de commande commence par PV- suivi de 8 caractères."),
});

const UNAVAILABLE = "Le service est momentanément indisponible. Réessayez dans quelques minutes.";
const NOT_FOUND =
  "Aucune commande ne correspond à ce numéro et à cette adresse e-mail. Vérifiez l’e-mail de confirmation de votre commande.";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/**
 * Per 15 minutes: 10 attempts per visitor and e-mail address (guessing order numbers),
 * 100 per visitor overall. IP addresses and e-mails are hashed, never stored in clear.
 */
async function allowed(admin: NonNullable<ReturnType<typeof createAdminClient>>, email: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const limits = [
    { key: `retractation:${hash(`${ip}|${email.toLowerCase()}`)}`, max: 10 },
    { key: `retractation:${hash(ip)}`, max: 100 },
  ];
  for (const { key, max } of limits) {
    const { data } = await admin.rpc("rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: 900,
    });
    if (data === false) return false;
  }
  return true;
}

/**
 * Online withdrawal function, in two steps and without login:
 * 1. identify the order (name, e-mail, order number); 2. « Confirmer la rétractation ».
 */
export async function withdraw(_: WithdrawalState, formData: FormData): Promise<WithdrawalState> {
  const intent = formData.get("intent");
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    reference: String(formData.get("reference") ?? ""),
  };
  if (intent === "back") return { step: "identify", values: raw };

  const parsed = identifySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { step: "identify", message: "Vérifiez le formulaire.", fieldErrors, values: raw };
  }
  const { name, email } = parsed.data;
  const reference = parsed.data.reference as string;

  const admin = createAdminClient();
  if (!admin) return { step: "identify", message: UNAVAILABLE, values: raw };
  if (!(await allowed(admin, email))) {
    return {
      step: "identify",
      message: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
      values: raw,
    };
  }

  const days = withdrawalDays();
  if (intent !== "confirm") {
    const { data, error } = await admin.rpc("withdrawal_lookup", {
      p_reference: reference,
      p_email: email,
      p_withdrawal_days: days,
    });
    if (error) return { step: "identify", message: UNAVAILABLE, values: raw };
    if (!data) return { step: "identify", message: NOT_FOUND, values: raw };
    const order = data as Extract<WithdrawalState, { step: "confirm" }>["order"];
    return { step: "confirm", values: { reference, email, name }, order };
  }

  const { data, error } = await admin.rpc("request_withdrawal", {
    p_reference: reference,
    p_email: email,
    p_consumer_name: name,
    p_withdrawal_days: days,
    p_seller: sellerSnapshot(),
  });
  if (error || !data) return { step: "identify", message: UNAVAILABLE, values: raw };
  const result = data as {
    status: string;
    withdrawalId: string;
    reference: string;
    email: string;
    requestedAt: string;
    amountCents: number;
    paymentIntent: string | null;
    titles: string[];
  };
  if (result.status !== "withdrawn") {
    return {
      step: "identify",
      message:
        result.status === "not_found"
          ? NOT_FOUND
          : "La rétractation n’est plus possible pour cette commande.",
      values: raw,
    };
  }

  // 1. Acknowledgement on a durable medium, immediately.
  let emailSent = false;
  try {
    await emailProvider().send(
      withdrawalAckEmail({
        email: result.email,
        consumerName: name,
        reference: result.reference,
        requestedAt: result.requestedAt,
        amountCents: result.amountCents,
        titles: result.titles,
      }),
    );
    emailSent = true;
    await admin
      .from("withdrawals")
      .update({ ack_sent_at: new Date().toISOString() })
      .eq("id", result.withdrawalId);
  } catch (e) {
    console.error(`[withdrawal] acknowledgement e-mail failed: ${(e as Error).message}`);
  }

  // 2. Refund through the payment provider (failures are retried from the back-office).
  if (result.paymentIntent) {
    try {
      const refund = await paymentProvider().refund(
        result.paymentIntent,
        `withdrawal-${result.withdrawalId}`,
      );
      await admin
        .from("withdrawals")
        .update({
          stripe_refund_id: refund.id,
          refund_status:
            refund.status === "failed"
              ? "failed"
              : refund.status === "succeeded"
                ? "succeeded"
                : "pending",
          refunded_at: refund.status === "succeeded" ? new Date().toISOString() : null,
        })
        .eq("id", result.withdrawalId);
    } catch (e) {
      console.error(`[withdrawal] refund failed: ${(e as Error).message}`);
      await admin
        .from("withdrawals")
        .update({ refund_status: "failed" })
        .eq("id", result.withdrawalId);
    }
  }

  return {
    step: "done",
    reference: result.reference,
    requestedAt: result.requestedAt,
    email: result.email,
    emailSent,
  };
}
