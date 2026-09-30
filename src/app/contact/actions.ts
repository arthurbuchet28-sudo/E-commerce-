"use server";

import { z } from "zod";

import type { FormState } from "@/app/compte/actions";
import { CONTACT_TOPICS } from "@/lib/contact/topics";
import { composeEmail } from "@/lib/email/compose";
import { serverEnv } from "@/lib/env.server";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { emailProvider } from "@/lib/services/email";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().trim().min(1, "Indiquez votre nom.").max(120, "120 caractères maximum."),
  email: z
    .email("Indiquez une adresse e-mail valide, pour que nous puissions vous répondre.")
    .max(320),
  topic: z.enum(Object.keys(CONTACT_TOPICS) as [keyof typeof CONTACT_TOPICS], {
    error: "Choisissez un sujet.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Votre message est trop court (10 caractères minimum).")
    .max(5000, "5 000 caractères maximum."),
});

const SENT: FormState = {
  status: "success",
  message: "Merci, votre message est bien envoyé. Nous vous répondons par e-mail.",
};

/** Contact form: validated, rate-limited, stored, then notified by e-mail when configured. */
export async function sendContactMessage(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("site_web")) return SENT;
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Vérifiez les champs signalés.", fieldErrors, values: raw };
  }
  const admin = createAdminClient();
  const unavailable: FormState = {
    status: "error",
    message: "L’envoi est momentanément impossible. Réessayez plus tard.",
    values: raw,
  };
  if (!admin) return unavailable;
  const ok = await withinRateLimit(admin, "contact", parsed.data.email, {
    perEmail: 5,
    perVisitor: 20,
    windowSeconds: 3600,
  });
  if (!ok)
    return { status: "error", message: "Trop de messages. Réessayez dans une heure.", values: raw };

  const { error } = await admin.from("contact_messages").insert(parsed.data);
  if (error) {
    console.error(`[contact] ${error.message}`);
    return unavailable;
  }
  const to = serverEnv().CONTACT_EMAIL;
  if (to) {
    try {
      await emailProvider().send(
        composeEmail(to, `[Contact] ${CONTACT_TOPICS[parsed.data.topic]}`, [
          `De : ${parsed.data.name} <${parsed.data.email}>`,
          parsed.data.message,
        ]),
      );
    } catch (e) {
      // The message is stored: it stays visible in /admin/messages.
      console.error(`[contact] notification failed: ${(e as Error).message}`);
    }
  }
  return SENT;
}
