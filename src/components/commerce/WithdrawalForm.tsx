"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { withdraw, type WithdrawalState } from "@/app/retractation/actions";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { TextField } from "@/components/ui/Field";
import { formatDateParis, formatDateTimeParis, formatEuros } from "@/lib/commerce/format";

const initial: WithdrawalState = { step: "identify" };

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-ui border border-l-[6px] border-danger bg-danger-soft p-4"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
      <p>{children}</p>
    </div>
  );
}

const reasons: Record<string, string> = {
  waived:
    "Vous avez demandé l’accès immédiat à la formation en renonçant expressément à votre droit de rétractation, et vous l’avez commencée : la rétractation n’est plus possible pour cette commande.",
  period_over: "Le délai de rétractation de cette commande a pris fin.",
  already_withdrawn: "Cette commande a déjà fait l’objet d’une rétractation ou d’un remboursement.",
  not_paid: "Cette commande n’a pas été payée : il n’y a rien à rétracter.",
};

/** Two-step withdrawal: identify the order, then « Confirmer la rétractation ». */
export function WithdrawalForm({ withdrawalDays }: { withdrawalDays: number }) {
  const [state, action, pending] = useActionState(withdraw, initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Moves focus to the new step so screen-reader users hear the change.
  useEffect(() => {
    if (state !== initial) headingRef.current?.focus();
  }, [state]);

  if (state.step === "done") {
    return (
      <section aria-labelledby="retractation-etape" className="flex flex-col gap-4">
        <h2 id="retractation-etape" ref={headingRef} tabIndex={-1} className="text-h2">
          Rétractation enregistrée
        </h2>
        <div
          role="status"
          className="flex items-start gap-3 rounded-ui border border-l-[6px] border-sage bg-sage-soft p-4"
        >
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-sage" />
          <div className="flex flex-col gap-2">
            <p>
              Votre rétractation pour la commande <strong>{state.reference}</strong> a été
              enregistrée le {formatDateTimeParis(state.requestedAt)}.
            </p>
            <p>
              {state.emailSent
                ? `Un accusé de réception vient d’être envoyé à ${state.email}.`
                : "L’accusé de réception par e-mail n’a pas pu partir : conservez une capture de cette page, nous vous le renverrons."}{" "}
              Le remboursement est effectué sur le moyen de paiement utilisé lors de l’achat.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state.step === "confirm") {
    const { order, values } = state;
    const eligible = order.eligibility === "eligible";
    return (
      <section aria-labelledby="retractation-etape" className="flex flex-col gap-5">
        <h2 id="retractation-etape" ref={headingRef} tabIndex={-1} className="text-h2">
          Étape 2 sur 2 · Confirmer la rétractation
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-ui border border-line bg-sheet p-6">
          <dt className="text-muted">Commande</dt>
          <dd className="font-semibold">{order.reference}</dd>
          <dt className="text-muted">Formation</dt>
          <dd>{order.titles.join(", ")}</dd>
          <dt className="text-muted">Payée le</dt>
          <dd>{formatDateParis(order.paidAt)}</dd>
          <dt className="text-muted">Montant</dt>
          <dd>{formatEuros(order.amountCents)} TTC</dd>
          <dt className="text-muted">Fin du délai</dt>
          <dd>{formatDateParis(order.deadline)}</dd>
        </dl>
        {eligible ? (
          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="reference" value={values.reference} />
            <input type="hidden" name="email" value={values.email} />
            <input type="hidden" name="name" value={values.name} />
            <p>
              En confirmant, vous vous rétractez du contrat : votre accès à la formation est fermé
              et vous êtes remboursé du montant payé.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" name="intent" value="confirm" size="lg" disabled={pending}>
                {pending ? "Enregistrement…" : "Confirmer la rétractation"}
              </Button>
              <Button
                type="submit"
                name="intent"
                value="back"
                variant="secondary"
                disabled={pending}
              >
                Modifier ma saisie
              </Button>
            </div>
          </form>
        ) : (
          <>
            <Callout type="attention" title="Rétractation impossible">
              <p className="mb-2">{reasons[order.eligibility]}</p>
              <p>
                Une question ? Écrivez-nous depuis la page{" "}
                <Link href="/contact" className="link">
                  Contact
                </Link>
                .
              </p>
            </Callout>
            <form action={action}>
              <input type="hidden" name="reference" value={values.reference} />
              <input type="hidden" name="email" value={values.email} />
              <input type="hidden" name="name" value={values.name} />
              <Button type="submit" name="intent" value="back" variant="secondary">
                Rechercher une autre commande
              </Button>
            </form>
          </>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="retractation-etape" className="flex flex-col gap-5">
      <h2 id="retractation-etape" ref={headingRef} tabIndex={-1} className="text-h2">
        Étape 1 sur 2 · Identifier ma commande
      </h2>
      <form action={action} className="flex flex-col gap-5" noValidate>
        {state.message && <Alert>{state.message}</Alert>}
        <TextField
          id="retractation-nom"
          name="name"
          label="Nom et prénom"
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          error={state.fieldErrors?.name}
        />
        <TextField
          id="retractation-email"
          name="email"
          type="email"
          label="Adresse e-mail utilisée pour la commande"
          hint="L’accusé de réception de votre rétractation sera envoyé à cette adresse."
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
        />
        <TextField
          id="retractation-commande"
          name="reference"
          label="Numéro de commande"
          hint="Il figure dans l’e-mail de confirmation et dans votre espace membre, par exemple PV-7K3M9Q2A."
          autoComplete="off"
          spellCheck={false}
          required
          defaultValue={state.values?.reference}
          error={state.fieldErrors?.reference}
        />
        <div>
          <Button type="submit" name="intent" value="identify" size="lg" disabled={pending}>
            {pending ? "Recherche…" : "Continuer"}
          </Button>
        </div>
        <p className="text-small text-muted">
          Délai de rétractation : {withdrawalDays}&nbsp;jours à compter de l’achat.
        </p>
      </form>
    </section>
  );
}
