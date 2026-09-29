"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { confirmNewsletter, type ConfirmState } from "@/app/newsletter/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";

const idle: ConfirmState = { status: "idle" };

export function ConfirmSubscription({ token }: { token: string }) {
  const [state, action, pending] = useActionState(confirmNewsletter, idle);

  if (state.status === "confirmed") {
    return (
      <div role="status" className="flex flex-col gap-4">
        <p className="flex items-start gap-3 font-semibold">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-sage" />
          Votre inscription est confirmée. La checklist vous a aussi été envoyée par e-mail.
        </p>
        <div>
          <ButtonLink href={state.checklistUrl as never}>Télécharger la checklist (PDF)</ButtonLink>
        </div>
      </div>
    );
  }
  if (state.status !== "idle") {
    return (
      <Callout type="attention" title="La confirmation n’a pas abouti">
        <p>
          {state.status === "expired"
            ? "Ce lien a expiré. "
            : state.status === "invalid"
              ? "Ce lien n’est plus valable. "
              : "Une erreur est survenue. "}
          <Link href="/ressources" className="link">
            Refaire une demande
          </Link>
          .
        </p>
      </Callout>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <p>Un dernier clic pour confirmer que vous souhaitez recevoir la newsletter.</p>
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Confirmation…" : "Confirmer mon inscription"}
        </Button>
      </div>
    </form>
  );
}
