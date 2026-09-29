"use client";

import { useState } from "react";

import { CalcSheet } from "@/components/ui/CalcSheet";
import { Callout } from "@/components/ui/Callout";
import { Checkbox } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatEuro, formatNumber, formatPercent, parseFrNumber } from "@/lib/calc/format";
import { simulateMicro, type MicroThresholds } from "@/lib/calc/micro";

import { NumberField, num, numberError } from "./NumberField";
import { SaveSimulation } from "./SaveSimulation";
import { useInitialInputs } from "./useInitialInputs";

const MICRO_KEYS = [
  "activity",
  "period",
  "revenue",
  "startDate",
  "simYear",
  "contribution",
  "liberatoire",
  "liberatoireRate",
] as const;

type Activity = "vente" | "services";

type Props = {
  year: number;
  thresholds: Record<Activity, MicroThresholds>;
  contributionRates: Record<Activity, number | null>;
  liberatoireRates: Record<Activity, number | null>;
};

const levelToCallout = { info: "info", attention: "attention", alerte: "legal" } as const;

/** Tool 2 — micro-entreprise simulator. Unknown rates are left for the user to fill in. */
export function MicroSimulator({ year, thresholds, contributionRates, liberatoireRates }: Props) {
  const init = useInitialInputs(MICRO_KEYS);
  const initialActivity: Activity = init.activity === "services" ? "services" : "vente";
  const rateText = (r: number | null) => (r === null ? "" : formatNumber(r * 100));
  const [activity, setActivity] = useState<Activity>(initialActivity);
  const [period, setPeriod] = useState<"mois" | "an">(init.period === "an" ? "an" : "mois");
  const [revenue, setRevenue] = useState(init.revenue ?? "1500");
  const [startDate, setStartDate] = useState(
    /^\d{4}-\d{2}-\d{2}$/.test(init.startDate ?? "") ? init.startDate! : "",
  );
  const [simYear, setSimYear] = useState(Number(init.simYear) === year + 1 ? year + 1 : year);
  const [contribution, setContribution] = useState(
    init.contribution ?? rateText(contributionRates[initialActivity]),
  );
  const [liberatoire, setLiberatoire] = useState(init.liberatoire === "oui");
  const [liberatoireRate, setLiberatoireRate] = useState(
    init.liberatoireRate ?? rateText(liberatoireRates[initialActivity]),
  );

  function changeActivity(a: Activity) {
    setActivity(a);
    setContribution(rateText(contributionRates[a]));
    setLiberatoireRate(rateText(liberatoireRates[a]));
  }

  const invalid =
    numberError(revenue, { min: 0 }) !== null ||
    numberError(contribution, { min: 0, max: 100, optional: true }) !== null ||
    numberError(liberatoireRate, { min: 0, max: 100, optional: true }) !== null;

  const annualRevenue = period === "mois" ? num(revenue) * 12 : num(revenue);
  const contributionValue = parseFrNumber(contribution);
  const liberatoireValue = parseFrNumber(liberatoireRate);
  const t = thresholds[activity];
  const r = simulateMicro(
    {
      annualRevenue,
      startDate: startDate || null,
      year: simYear,
      contributionRate: contributionValue === null ? null : contributionValue / 100,
      liberatoire,
      liberatoireRate: liberatoireValue === null ? null : liberatoireValue / 100,
    },
    t,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Données de la simulation"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Type d’activité</legend>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="activite"
              className="size-5 accent-ink"
              checked={activity === "vente"}
              onChange={() => changeActivity("vente")}
            />
            Vente de marchandises
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="activite"
              className="size-5 accent-ink"
              checked={activity === "services"}
              onChange={() => changeActivity("services")}
            />
            Prestations de services
          </label>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Je saisis mon chiffre d’affaires</legend>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="periode"
              className="size-5 accent-ink"
              checked={period === "mois"}
              onChange={() => setPeriod("mois")}
            />
            par mois (moyenne)
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="periode"
              className="size-5 accent-ink"
              checked={period === "an"}
              onChange={() => setPeriod("an")}
            />
            pour l’année
          </label>
        </fieldset>
        <NumberField
          id="ca"
          label={
            period === "mois"
              ? "Chiffre d’affaires mensuel encaissé"
              : "Chiffre d’affaires annuel encaissé"
          }
          unit="€"
          value={revenue}
          onChange={setRevenue}
          min={0}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="annee" className="font-semibold">
              Année simulée
            </label>
            <select
              id="annee"
              value={simYear}
              onChange={(e) => setSimYear(Number(e.target.value))}
              className="min-h-11 rounded-ui border border-border bg-sheet px-3"
            >
              <option value={year}>{year}</option>
              <option value={year + 1}>{year + 1}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="debut" className="font-semibold">
              Date de début d’activité <span className="font-normal text-muted">(facultatif)</span>
            </label>
            <input
              id="debut"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="min-h-11 rounded-ui border border-border bg-sheet px-3"
              aria-describedby="debut-hint"
            />
            <p id="debut-hint" className="text-small text-muted">
              Pour le calcul au prorata l’année de création.
            </p>
          </div>
        </div>
        <NumberField
          id="taux-cotisations"
          label="Taux de cotisations sociales"
          unit="%"
          value={contribution}
          onChange={setContribution}
          min={0}
          max={100}
          optional
          hint={
            contributionRates[activity] === null
              ? "Taux à relever sur urssaf.fr [À VÉRIFIER]"
              : undefined
          }
        />
        <Checkbox
          id="vl"
          label="J’ai opté pour le versement libératoire de l’impôt sur le revenu"
          checked={liberatoire}
          onChange={(e) => setLiberatoire(e.target.checked)}
        />
        {liberatoire && (
          <NumberField
            id="taux-vl"
            label="Taux du versement libératoire"
            unit="%"
            value={liberatoireRate}
            onChange={setLiberatoireRate}
            min={0}
            max={100}
            optional
            hint={
              liberatoireRates[activity] === null
                ? "Taux à relever sur impots.gouv.fr [À VÉRIFIER]"
                : undefined
            }
          />
        )}
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        {invalid ? (
          <Callout type="attention" title="Simulation en attente">
            <p>Corrigez les champs signalés pour afficher le résultat.</p>
          </Callout>
        ) : (
          <>
            <p className="sr-only" aria-live="polite">
              {`Chiffre d’affaires annuel : ${formatEuro(annualRevenue, true)}. ${r.alerts.map((a) => a.title).join(". ")}`}
            </p>
            <CalcSheet
              title={`Votre année ${simYear}`}
              rows={[
                { label: "Chiffre d’affaires annuel", value: formatEuro(annualRevenue, true) },
                {
                  label: "Cotisations sociales",
                  value:
                    r.contributions === null
                      ? "taux à renseigner"
                      : `− ${formatEuro(r.contributions, true)}`,
                },
                ...(liberatoire
                  ? [
                      {
                        label: "Versement libératoire",
                        value:
                          r.incomeTax === null
                            ? "taux à renseigner"
                            : `− ${formatEuro(r.incomeTax, true)}`,
                      },
                    ]
                  : []),
                {
                  label: "Reste avant vos dépenses",
                  value: r.remaining === null ? "—" : formatEuro(r.remaining, true),
                  hint: "Achats, frais et abonnements ne sont pas déduits",
                  kind: "total" as const,
                },
              ]}
            />
            <div className="flex flex-col gap-4 rounded-ui border border-line bg-sheet p-5">
              <ProgressBar
                value={Math.min(annualRevenue, r.ceiling)}
                max={Math.max(r.ceiling, 1)}
                label={`Plafond micro-entreprise : ${formatEuro(r.ceiling, true)}${r.prorata < 1 && r.prorata > 0 ? ` (au prorata : ${formatPercent(r.prorata, 0)} de l’année)` : ""}`}
              />
              <ProgressBar
                value={Math.min(annualRevenue, t.vatThreshold)}
                max={t.vatThreshold}
                label={`Franchise de TVA : ${formatEuro(t.vatThreshold, true)} (seuil majoré ${formatEuro(t.vatThresholdIncreased, true)})`}
              />
            </div>
            <SaveSimulation
              tool="simulateur-micro-entreprise"
              inputs={{
                activity,
                period,
                revenue,
                startDate,
                simYear: String(simYear),
                contribution,
                liberatoire: liberatoire ? "oui" : "non",
                liberatoireRate,
              }}
              defaultTitle={`Micro-entreprise ${simYear}`}
            />
            {r.alerts.map((a) => (
              <Callout key={a.id} type={levelToCallout[a.level]} title={a.title}>
                <p>{a.message}</p>
              </Callout>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
