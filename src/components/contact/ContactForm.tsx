"use client";

import Link from "next/link";
import { useActionState } from "react";

import { sendContactMessage } from "@/app/contact/actions";
import type { FormState } from "@/app/compte/actions";
import { FormMessage } from "@/components/account/FormMessage";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { CONTACT_RETENTION_MONTHS, CONTACT_TOPICS } from "@/lib/contact/topics";

const idle: FormState = { status: "idle" };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, idle);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-site">Ne pas remplir</label>
        <input id="contact-site" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <TextField
        id="contact-nom"
        name="name"
        label="Nom"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
      />
      <TextField
        id="contact-email"
        name="email"
        type="email"
        label="Adresse e-mail"
        hint="Pour vous répondre, rien d’autre."
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <SelectField
        id="contact-sujet"
        name="topic"
        label="Sujet"
        defaultValue={state.values?.topic ?? "question"}
        error={state.fieldErrors?.topic}
      >
        {Object.entries(CONTACT_TOPICS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
      <TextAreaField
        id="contact-message"
        name="message"
        label="Message"
        rows={7}
        required
        defaultValue={state.values?.message}
        error={state.fieldErrors?.message}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer mon message"}
        </Button>
      </div>
      <p className="text-small text-muted">
        Votre message est conservé {CONTACT_RETENTION_MONTHS / 12} ans au plus, puis supprimé.
        Détails dans la{" "}
        <Link href="/confidentialite" className="link">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
