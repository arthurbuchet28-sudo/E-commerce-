"use client";

import { useState } from "react";

import { CalcSheet } from "@/components/ui/CalcSheet";
import { Callout } from "@/components/ui/Callout";
import { computeBreakEven } from "@/lib/calc/breakEven";
import { formatEuro, parseFrNumber } from "@/lib/calc/format";

import { BreakEvenChart } from "./BreakEvenChart";
import { NumberField, num, numberError } from "./NumberField";

/** Tool 3 — monthly break-even. */
export function BreakEvenCalculator() {
  const [fixed, setFixed] = useState("300");
  const [margin, setMargin] = useState("12");
  const [basket, setBasket] = useState("");

  const invalid =
    numberError(fixed, { min: 0 }) !== null ||
    numberError(margin, {}) !== null ||
    numberError(basket, { min: 0, optional: true }) !== null;
  const r = computeBreakEven({
    fixedCostsMonthly: num(fixed),
    marginPerSale: num(margin),
    averageOrder: parseFrNumber(basket),
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Données du calcul"
      >
        <NumberField
          id="charges"
          label="Charges fixes par mois"
          unit="€"
          value={fixed}
          onChange={setFixed}
          min={0}
          hint="Abonnements, logiciels, assurance, publicité fixe…"
        />
        <NumberField
          id="marge"
          label="Marge par vente"
          unit="€"
          value={margin}
          onChange={setMargin}
          hint="Ce qu’il vous reste après les coûts de chaque vente : reprenez la marge nette du calculateur de prix."
        />
        <NumberField
          id="panier"
          label="Panier moyen"
          unit="€"
          value={basket}
          onChange={setBasket}
          min={0}
          optional
          hint="Pour exprimer l’objectif en chiffre d’affaires"
        />
      </form>
      <div className="flex flex-col gap-5">
        {invalid ? (
          <Callout type="attention" title="Calcul en attente">
            <p>Corrigez les champs signalés pour afficher le résultat.</p>
          </Callout>
        ) : r.salesNeeded === null ? (
          <Callout type="attention" title="Seuil impossible à atteindre">
            <p aria-live="polite">
              Avec une marge nulle ou négative, plus vous vendez, plus vous perdez. Revoyez d’abord
              votre prix ou vos coûts.
            </p>
          </Callout>
        ) : (
          <>
            <p
              className="sr-only"
              aria-live="polite"
            >{`Il faut ${r.salesNeeded} ventes par mois pour couvrir vos charges fixes.`}</p>
            <CalcSheet
              title="Votre seuil de rentabilité"
              rows={[
                { label: "Ventes nécessaires par mois", value: `${r.salesNeeded}`, kind: "total" },
                ...(r.revenueNeeded !== null
                  ? [
                      {
                        label: "Chiffre d’affaires correspondant",
                        value: formatEuro(r.revenueNeeded, true),
                      },
                    ]
                  : []),
                {
                  label: "Soit environ, par semaine",
                  value: `${Math.ceil(r.salesNeeded / 4.33)} ventes`,
                },
              ]}
            />
            <BreakEvenChart series={r.series} fixedCosts={num(fixed)} salesNeeded={r.salesNeeded} />
          </>
        )}
      </div>
    </div>
  );
}
