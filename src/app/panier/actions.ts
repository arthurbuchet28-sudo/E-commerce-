"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { FormState } from "@/app/compte/actions";
import { CGV_VERSION, WAIVER_TEXT_VERSION } from "@/config/legal";
import { publicEnv } from "@/lib/env";
import { paymentProvider } from "@/lib/services/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  formation: z.string().regex(/^[a-z0-9-]{3,80}$/),
  cgv: z.literal("on", { error: "Acceptez les conditions générales de vente pour continuer." }),
  immediate: z.literal("on").optional(),
});

type OrderCreated = {
  orderId: string;
  reference: string;
  email: string;
  amountCents: number;
  title: string;
};

/**
 * Creates the pending order (price read from the database), then opens Stripe Checkout.
 * Access is granted later, by the signed webhook only.
 */
export async function startCheckout(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = checkoutSchema.safeParse({
    formation: formData.get("formation"),
    cgv: formData.get("cgv") ?? undefined,
    immediate: formData.get("immediate") ?? undefined,
  });
  const values = { immediate: formData.get("immediate") === "on" ? "on" : "" };
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { status: "error", message: "Vérifiez le formulaire.", fieldErrors, values };
  }
  const { formation, immediate } = parsed.data;
  const cartPath = `/panier?formation=${formation}`;

  const { supabase, user } = await getUser();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return { status: "error", message: "Le paiement est momentanément indisponible.", values };
  }
  if (!user) redirect(`/compte/connexion?next=${encodeURIComponent(cartPath)}` as Route);

  const { data, error } = await supabase.rpc("create_order", {
    p_course_slug: formation,
    p_immediate_access: immediate === "on",
    p_cgv_version: CGV_VERSION,
    p_waiver_text_version: immediate === "on" ? WAIVER_TEXT_VERSION : "",
  });
  if (error?.message === "already_owned") redirect(`/apprendre/${formation}` as Route);
  if (error || !data) {
    return { status: "error", message: "La commande n’a pas pu être créée. Réessayez.", values };
  }
  const order = data as OrderCreated;

  const site = publicEnv.NEXT_PUBLIC_SITE_URL;
  let checkoutUrl: string;
  try {
    const session = await paymentProvider().createCheckout({
      orderId: order.orderId,
      reference: order.reference,
      email: order.email,
      lines: [{ title: order.title, amountCents: order.amountCents }],
      successUrl: `${site}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${site}/commande/annulee?formation=${formation}`,
    });
    const { error: attachError } = await admin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.orderId)
      .eq("status", "pending");
    if (attachError) throw new Error(attachError.message);
    checkoutUrl = session.url;
  } catch (e) {
    console.error(`[checkout] ${(e as Error).message}`);
    return {
      status: "error",
      message: "Le service de paiement ne répond pas. Aucun montant n’a été débité : réessayez.",
      values,
    };
  }
  redirect(checkoutUrl as Route);
}
