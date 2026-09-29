"use client";

import { useState } from "react";

import { CalcSheet, type CalcRow } from "@/components/ui/CalcSheet";
import { Callout } from "@/components/ui/Callout";
import { formatEuro, formatNumber, formatPercent, parseFrNumber } from "@/lib/calc/format";
import { computePricing } from "@/lib/calc/pricing";

import { NumberField, num, numberError } from "./NumberField";

export type VatOption = { value: number; label: string };

type Props = { vatOptions: VatOption[]; defaultSocialRate: number | null };

/** Tool 1 — selling price and margin. Values are example inputs, editable by the user. */
export function PricingCalculator({ vatOptions, defaultSocialRate }: Props) {
  const [f, setF] = useState({
    price: "39",
    purchaseCost: "12",
    packagingCost: "1",
    shippingCost: "5",
    shippingCharged: "4,90",
    commission: "0",
    paymentRate: "",
    paymentFixed: "",
    social: defaultSocialRate === null ? "" : formatNumber(defaultSocialRate),
  });
  const [vatRegime, setVatRegime] = useState<"franchise" | "assujetti">("franchise");
  const [vatRate, setVatRate] = useState(String(vatOptions[0]?.value ?? 0));
  const set = (key: keyof typeof f) => (value: string) =>
    setF((prev) => ({ ...prev, [key]: value }));

  const required = [
    "price",
    "purchaseCost",
    "packagingCost",
    "shippingCost",
    "shippingCharged",
  ] as const;
  const invalid =
    required.some((k) => numberError(f[k], { min: 0 })) ||
    (["commission", "paymentRate", "social"] as const).some((k) =>
      numberError(f[k], { min: 0, max: 100, optional: true }),
    ) ||
    numberError(f.paymentFixed, { min: 0, optional: true }) !== null;

  const r = computePricing({
    price: num(f.price),
    purchaseCost: num(f.purchaseCost),
    packagingCost: num(f.packagingCost),
    shippingCost: num(f.shippingCost),
    shippingCharged: num(f.shippingCharged),
    commissionRate: num(f.commission) / 100,
    paymentFeeRate: num(f.paymentRate) / 100,
    paymentFeeFixed: num(f.paymentFixed),
    vatRate: vatRegime === "franchise" ? 0 : Number(vatRate) / 100,
    socialRate: num(f.social) / 100,
  });
  const socialKnown = parseFrNumber(f.social) !== null;

  const rows: CalcRow[] = [
    {
      label: "Payé par le client (TTC)",
      value: formatEuro(r.revenueTtc),
      hint: "Prix + frais de port facturés",
    },
    ...(vatRegime === "assujetti"
      ? [{ label: "TVA à reverser", value: `− ${formatEuro(r.vatCollected)}` }]
      : []),
    { label: "Chiffre d’affaires HT", value: formatEuro(r.revenueHt), kind: "subtotal" as const },
    {
      label: "Coût du produit et emballage",
      value: `− ${formatEuro(num(f.purchaseCost) + num(f.packagingCost))}`,
    },
    { label: "Frais de port réels", value: `− ${formatEuro(num(f.shippingCost))}` },
    {
      label: "Commission",
      value: `− ${formatEuro(r.commission)}`,
      hint: "Sur le total payé par le client",
    },
    { label: "Frais de paiement", value: `− ${formatEuro(r.paymentFees)}` },
    {
      label: "Marge sur coûts variables",
      value: formatEuro(r.contribution),
      kind: "subtotal" as const,
    },
    {
      label: "Cotisations sociales estimées",
      value: socialKnown ? `− ${formatEuro(r.socialContributions)}` : "non renseignées",
      hint: "Sur le chiffre d’affaires HT",
    },
    { label: "Marge nette par commande", value: formatEuro(r.netMargin), kind: "total" as const },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Données du calcul"
      >
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-serif text-h3 font-semibold text-ink">Votre produit</legend>
          <NumberField
            id="prix"
            label="Prix de vente TTC"
            unit="€"
            value={f.price}
            onChange={set("price")}
            min={0}
          />
          <NumberField
            id="achat"
            label="Coût d’achat ou de fabrication"
            unit="€"
            value={f.purchaseCost}
            onChange={set("purchaseCost")}
            min={0}
            hint="HT si vous êtes assujetti à la TVA"
          />
          <NumberField
            id="emballage"
            label="Emballage"
            unit="€"
            value={f.packagingCost}
            onChange={set("packagingCost")}
            min={0}
          />
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-serif text-h3 font-semibold text-ink">Livraison</legend>
          <NumberField
            id="port-reel"
            label="Frais de port réels"
            unit="€"
            value={f.shippingCost}
            onChange={set("shippingCost")}
            min={0}
            hint="Ce que vous paie le transporteur"
          />
          <NumberField
            id="port-facture"
            label="Frais de port facturés au client"
            unit="€"
            value={f.shippingCharged}
            onChange={set("shippingCharged")}
            min={0}
            hint="0 si la livraison est offerte"
          />
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-serif text-h3 font-semibold text-ink">Frais de vente</legend>
          <NumberField
            id="commission"
            label="Commission de la plateforme ou marketplace"
            unit="%"
            value={f.commission}
            onChange={set("commission")}
            min={0}
            max={100}
            optional
            hint="Voir la page tarifs de la plateforme"
          />
          <NumberField
            id="paiement-pct"
            label="Frais de paiement"
            unit="%"
            value={f.paymentRate}
            onChange={set("paymentRate")}
            min={0}
            max={100}
            optional
            hint="Voir les tarifs de votre prestataire"
          />
          <NumberField
            id="paiement-fixe"
            label="Frais de paiement fixes par commande"
            unit="€"
            value={f.paymentFixed}
            onChange={set("paymentFixed")}
            min={0}
            optional
          />
        </fieldset>
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 font-serif text-h3 font-semibold text-ink">
            TVA et cotisations
          </legend>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Régime de TVA">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="tva"
                className="size-5 accent-ink"
                checked={vatRegime === "franchise"}
                onChange={() => setVatRegime("franchise")}
              />
              Franchise en base de TVA (pas de TVA facturée)
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="tva"
                className="size-5 accent-ink"
                checked={vatRegime === "assujetti"}
                onChange={() => setVatRegime("assujetti")}
              />
              Assujetti à la TVA
            </label>
          </div>
          {vatRegime === "assujetti" && (
            <div className="flex flex-col gap-1">
              <label htmlFor="taux-tva" className="font-semibold">
                Taux de TVA du produit
              </label>
              <select
                id="taux-tva"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="min-h-11 rounded-ui border border-border bg-sheet px-3"
              >
                {vatOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <NumberField
            id="cotisations"
            label="Taux de cotisations sociales"
            unit="%"
            value={f.social}
            onChange={set("social")}
            min={0}
            max={100}
            optional
            hint={
              defaultSocialRate === null
                ? "Taux micro-entreprise à relever sur urssaf.fr [À VÉRIFIER]"
                : "Taux micro-entreprise pour la vente de marchandises"
            }
          />
        </fieldset>
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        {invalid ? (
          <Callout type="attention" title="Calcul en attente">
            <p>Corrigez les champs signalés pour afficher le résultat.</p>
          </Callout>
        ) : (
          <>
            <p className="sr-only" aria-live="polite">
              {`Marge nette par commande : ${formatEuro(r.netMargin)}. Prix minimum : ${r.minimumPrice === null ? "impossible à atteindre" : formatEuro(r.minimumPrice)}.`}
            </p>
            <CalcSheet title="Ce qu’il vous reste par commande" rows={rows} />
            {r.netMargin < 0 && (
              <Callout type="attention" title="Chaque vente vous coûte de l’argent">
                <p>Augmentez le prix, réduisez les coûts ou revoyez les frais de port facturés.</p>
              </Callout>
            )}
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 rounded-ui border border-line bg-sheet p-5 tabular-nums">
              <dt>Prix de vente minimum (TTC)</dt>
              <dd className="text-right font-semibold">
                {r.minimumPrice === null ? "Impossible" : formatEuro(r.minimumPrice)}
              </dd>
              <dt>Marge brute (prix HT − coût d’achat)</dt>
              <dd className="text-right">{formatEuro(r.grossMargin)}</dd>
              <dt>Taux de marge</dt>
              <dd className="text-right">
                {r.markupRate === null ? "—" : formatPercent(r.markupRate)}
              </dd>
              <dt>Taux de marque</dt>
              <dd className="text-right">
                {r.marginRate === null ? "—" : formatPercent(r.marginRate)}
              </dd>
              <dt>Coefficient multiplicateur</dt>
              <dd className="text-right">
                {r.multiplier === null ? "—" : formatNumber(r.multiplier)}
              </dd>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
