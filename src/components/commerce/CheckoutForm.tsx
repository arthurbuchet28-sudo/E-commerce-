"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { FormState } from "@/app/compte/actions";
import { startCheckout } from "@/app/panier/actions";
import { FormMessage } from "@/components/account/FormMessage";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";

const idle: FormState = { status: "idle" };

/** Checkout consents: nothing is pre-checked; the waiver is optional (access is then deferred). */
export function CheckoutForm({
  formation,
  waiverText,
  withdrawalDays,
  simulation,
}: {
  formation: string;
  waiverText: string;
  withdrawalDays: number;
  simulation: boolean;
}) {
  const [state, action, pending] = useActionState(startCheckout, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="formation" value={formation} />
      <fieldset className="flex flex-col gap-3 rounded-ui border border-line p-4">
        <legend className="px-1 font-semibold">Accès immédiat (facultatif)</legend>
        <Checkbox
          id="commande-acces-immediat"
          name="immediate"
          label={waiverText}
          defaultChecked={state.values?.immediate === "on"}
          hint={`Si vous ne cochez pas cette case, votre accès ouvrira ${withdrawalDays} jours après le paiement, à la fin du délai de rétractation. Vous pourrez vous rétracter d’ici là.`}
        />
      </fieldset>
      <Checkbox
        id="commande-cgv"
        name="cgv"
        required
        aria-required="true"
        label={
          <>
            J’ai lu et j’accepte les{" "}
            <Link href="/cgv" className="link" target="_blank">
              conditions générales de vente
            </Link>{" "}
            <span className="text-muted">(obligatoire, s’ouvre dans un nouvel onglet)</span>
          </>
        }
        error={state.fieldErrors?.cgv}
      />
      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Redirection…" : "Continuer vers le paiement sécurisé"}
        </Button>
        <p className="text-small text-muted">
          {simulation
            ? "Mode démonstration : le paiement est simulé, aucune carte n’est débitée."
            : "Paiement par carte sur la page sécurisée de Stripe. Le montant exact est rappelé avant validation."}
        </p>
      </div>
    </form>
  );
}
