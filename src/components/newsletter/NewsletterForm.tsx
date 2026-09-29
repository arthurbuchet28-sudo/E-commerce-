"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { FormState } from "@/app/compte/actions";
import { subscribeNewsletter } from "@/app/newsletter/actions";
import { FormMessage } from "@/components/account/FormMessage";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextField } from "@/components/ui/Field";
import { NEWSLETTER_CONSENT_TEXT } from "@/data/newsletter";

const idle: FormState = { status: "idle" };

/** Double opt-in sign-up. The consent box is never pre-checked; a hidden field traps bots. */
export function NewsletterForm({
  source,
  idPrefix = "newsletter",
  defaultEmail,
  submitLabel = "Recevoir la checklist",
}: {
  source: string;
  idPrefix?: string;
  defaultEmail?: string;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, idle);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="source" value={source} />
      {/* Honeypot: invisible to people, filled by some bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${idPrefix}-site`}>Ne pas remplir</label>
        <input
          id={`${idPrefix}-site`}
          name="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <TextField
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        label="Adresse e-mail"
        autoComplete="email"
        required
        defaultValue={state.values?.email ?? defaultEmail}
        error={state.fieldErrors?.email}
      />
      <Checkbox
        id={`${idPrefix}-consentement`}
        name="consent"
        label={NEWSLETTER_CONSENT_TEXT}
        error={state.fieldErrors?.consent}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi…" : submitLabel}
        </Button>
      </div>
      <p className="text-small text-muted">
        Votre adresse sert uniquement à l’envoi de la newsletter. Détails dans la{" "}
        <Link href="/confidentialite" className="link">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
