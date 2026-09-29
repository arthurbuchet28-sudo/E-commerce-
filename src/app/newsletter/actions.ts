"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { FormState } from "@/app/compte/actions";
import { confirmSubscription, requestSubscription, unsubscribe } from "@/lib/newsletter/server";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

const subscribeSchema = z.object({
  email: z.email("Indiquez une adresse e-mail valide.").max(320),
  consent: z.literal("on", { error: "Cochez la case pour confirmer votre accord." }),
  source: z.string().regex(/^[a-z0-9-]{1,40}$/),
});

const SENT: FormState = {
  status: "success",
  message:
    "Presque terminé : ouvrez l’e-mail que nous venons de vous envoyer et cliquez sur le lien pour confirmer votre inscription.",
};
const UNAVAILABLE: FormState = {
  status: "error",
  message: "L’inscription est momentanément indisponible. Réessayez plus tard.",
};

/**
 * Newsletter sign-up (double opt-in). Same answer whether or not the address is already
 * subscribed (no disclosure); bots filling the hidden field get a fake success.
 */
export async function subscribeNewsletter(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("site_web")) return SENT;
  const raw = { email: String(formData.get("email") ?? "").trim() };
  const parsed = subscribeSchema.safeParse({
    email: raw.email,
    consent: formData.get("consent") ?? undefined,
    source: formData.get("source"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { status: "error", message: "Vérifiez le formulaire.", fieldErrors, values: raw };
  }
  const admin = createAdminClient();
  if (!admin) return { ...UNAVAILABLE, values: raw };
  const allowed = await withinRateLimit(admin, "newsletter", parsed.data.email, {
    perEmail: 3,
    perVisitor: 20,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return {
      status: "error",
      message: "Trop de demandes. Réessayez dans une heure.",
      values: raw,
    };
  }
  try {
    await requestSubscription(admin, parsed.data.email, parsed.data.source);
  } catch (e) {
    console.error(`[newsletter] request failed: ${(e as Error).message}`);
    return { ...UNAVAILABLE, values: raw };
  }
  return SENT;
}

export type ConfirmState =
  | { status: "idle" }
  | { status: "confirmed"; checklistUrl: string }
  | { status: "invalid" | "expired" | "error" };

/** Explicit confirmation click (a link scanner opening the e-mail never confirms). */
export async function confirmNewsletter(
  _: ConfirmState,
  formData: FormData,
): Promise<ConfirmState> {
  const token = z
    .string()
    .regex(/^[A-Za-z0-9_-]{43}$/)
    .safeParse(formData.get("token"));
  if (!token.success) return { status: "invalid" };
  const admin = createAdminClient();
  if (!admin) return { status: "error" };
  try {
    return await confirmSubscription(admin, token.data);
  } catch (e) {
    console.error(`[newsletter] confirmation failed: ${(e as Error).message}`);
    return { status: "error" };
  }
}

/** Account page: unsubscribes the member's own (verified) address. */
export async function unsubscribeMember() {
  const { user } = await getUser();
  const admin = createAdminClient();
  if (!user?.email || !admin) return;
  const { data } = await admin
    .from("newsletter_subscribers")
    .select("access_token")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (data) await unsubscribe(admin, data.access_token);
  revalidatePath("/compte");
}
