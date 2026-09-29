"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { CGU_VERSION } from "@/config/legal";
import { publicEnv } from "@/lib/env";
import { safeNext } from "@/lib/security/redirect";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, getUser } from "@/lib/supabase/server";

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Non-sensitive values echoed back so the form keeps them after an error (never passwords). */
  values?: Record<string, string>;
};

const UNAVAILABLE: FormState = {
  status: "error",
  message: "L’espace membre est momentanément indisponible. Réessayez plus tard.",
};

const email = z
  .email({ message: "Saisissez une adresse e-mail valide, par exemple nom@exemple.fr." })
  .trim()
  .toLowerCase();
const password = z
  .string()
  .min(10, "Choisissez un mot de passe d’au moins 10 caractères.")
  .max(128, "128 caractères au maximum.")
  .regex(/[A-Za-z]/, "Ajoutez au moins une lettre.")
  .regex(/\d/, "Ajoutez au moins un chiffre.");

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    out[key] ??= issue.message;
  }
  return out;
}

function invalid(error: z.ZodError, values?: Record<string, string>): FormState {
  return {
    status: "error",
    message: "Corrigez les champs signalés.",
    fieldErrors: fieldErrors(error),
    values,
  };
}

/** Keeps the listed text fields of a submitted form. */
function keep(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}

// ---------------------------------------------------------------------------

const signUpSchema = z.object({
  email,
  password,
  displayName: z.string().trim().max(80, "80 caractères au maximum.").optional(),
  cgu: z.literal("on", {
    message: "Acceptez les conditions générales d’utilisation pour créer votre compte.",
  }),
});

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const values = keep(formData, ["email", "displayName", "cgu"]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, values);
  const supabase = await createClient();
  if (!supabase) return UNAVAILABLE;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/compte`,
      data: {
        display_name: parsed.data.displayName ?? "",
        cgu_accepted_at: new Date().toISOString(),
        cgu_version: CGU_VERSION,
      },
    },
  });
  if (error) {
    if (error.code === "weak_password") {
      return {
        status: "error",
        message: "Ce mot de passe est trop faible.",
        fieldErrors: { password: "Choisissez un mot de passe plus long et moins courant." },
        values,
      };
    }
    return {
      status: "error",
      message: "La création du compte a échoué. Réessayez dans quelques minutes.",
      values,
    };
  }
  // Same answer whether or not the address already has an account (no account enumeration).
  return {
    status: "success",
    message:
      "Presque terminé : un e-mail de confirmation vient de vous être envoyé. Cliquez sur le lien qu’il contient pour activer votre compte.",
  };
}

// ---------------------------------------------------------------------------

const signInSchema = z.object({
  email,
  password: z.string().min(1, "Saisissez votre mot de passe."),
  next: z.string().optional(),
});

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const values = keep(formData, ["email"]);
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, values);
  const supabase = await createClient();
  if (!supabase) return UNAVAILABLE;

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        status: "error",
        message: "Confirmez d’abord votre adresse e-mail grâce au lien reçu lors de l’inscription.",
        values,
      };
    }
    return { status: "error", message: "Adresse e-mail ou mot de passe incorrect.", values };
  }
  redirect(safeNext(parsed.data.next) as Route);
}

// ---------------------------------------------------------------------------

const emailOnly = z.object({ email });

export async function sendMagicLink(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailOnly.safeParse({ email: formData.get("email") });
  if (!parsed.success) return invalid(parsed.error, keep(formData, ["email"]));
  const supabase = await createClient();
  if (!supabase) return UNAVAILABLE;
  await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false },
  });
  return {
    status: "success",
    message:
      "Si un compte existe avec cette adresse, un lien de connexion vient de lui être envoyé.",
  };
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailOnly.safeParse({ email: formData.get("email") });
  if (!parsed.success) return invalid(parsed.error, keep(formData, ["email"]));
  const supabase = await createClient();
  if (!supabase) return UNAVAILABLE;
  await supabase.auth.resetPasswordForEmail(parsed.data.email);
  return {
    status: "success",
    message:
      "Si un compte existe avec cette adresse, un e-mail pour choisir un nouveau mot de passe vient de lui être envoyé.",
  };
}

const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirm"],
  });

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { supabase, user } = await getUser();
  if (!supabase) return UNAVAILABLE;
  if (!user)
    return {
      status: "error",
      message: "Votre lien a expiré. Demandez un nouvel e-mail de réinitialisation.",
    };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password")
      return { status: "error", message: "Choisissez un mot de passe différent de l’ancien." };
    return { status: "error", message: "Le mot de passe n’a pas pu être modifié. Réessayez." };
  }
  redirect("/compte?mot-de-passe=modifie");
}

// ---------------------------------------------------------------------------

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}

const profileSchema = z.object({
  displayName: z.string().trim().max(80, "80 caractères au maximum."),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, keep(formData, ["displayName"]));
  const { supabase, user } = await getUser();
  if (!supabase || !user) return UNAVAILABLE;
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName || null })
    .eq("id", user.id);
  if (error) return { status: "error", message: "L’enregistrement a échoué. Réessayez." };
  return { status: "success", message: "Votre nom est enregistré." };
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("confirmation") !== "SUPPRIMER") {
    return {
      status: "error",
      message: "Corrigez le champ signalé.",
      fieldErrors: { confirmation: "Saisissez SUPPRIMER en majuscules pour confirmer." },
    };
  }
  const { supabase, user } = await getUser();
  const admin = createAdminClient();
  if (!supabase || !user || !admin) return UNAVAILABLE;
  // Deleting the auth user cascades to the profile, progress and simulations (see migration).
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error)
    return { status: "error", message: "La suppression a échoué. Réessayez ou contactez-nous." };
  await supabase.auth.signOut();
  redirect("/compte/connexion?compte=supprime");
}
