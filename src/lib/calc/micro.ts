/**
 * Micro-entreprise simulator (tool 2). Thresholds and rates are passed in by the caller
 * (from src/data/reference.ts) so this module stays pure and testable.
 */

export type MicroThresholds = {
  /** Annual turnover ceiling of the micro regime for the activity. */
  ceiling: number;
  vatThreshold: number;
  vatThresholdIncreased: number;
};

export type MicroInput = {
  annualRevenue: number;
  /** ISO date of the start of activity; prorata applies when it falls within `year`. */
  startDate: string | null;
  year: number;
  /** Ratios (0.123 = 12.3 %), null while unknown. */
  contributionRate: number | null;
  liberatoire: boolean;
  liberatoireRate: number | null;
};

export type AlertLevel = "info" | "attention" | "alerte";
export type MicroAlert = { id: string; level: AlertLevel; title: string; message: string };

export type MicroResult = {
  prorata: number;
  ceiling: number;
  ceilingUsage: number;
  contributions: number | null;
  incomeTax: number | null;
  /** Turnover minus contributions and flat-rate tax: NOT a profit (expenses not deducted). */
  remaining: number | null;
  alerts: MicroAlert[];
};

const APPROACH = 0.8;

function daysInYear(year: number): number {
  return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
}

/** Share of the year covered by the activity (1 when started before `year`). */
export function prorataFactor(startDate: string | null, year: number): number {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || start.getUTCFullYear() < year) return 1;
  if (start.getUTCFullYear() > year) return 0;
  const end = Date.UTC(year + 1, 0, 1);
  return (end - start.getTime()) / 86_400_000 / daysInYear(year);
}

export function simulateMicro(i: MicroInput, t: MicroThresholds): MicroResult {
  const prorata = prorataFactor(i.startDate, i.year);
  const ceiling = t.ceiling * prorata;
  const ceilingUsage = ceiling > 0 ? i.annualRevenue / ceiling : 0;
  const contributions = i.contributionRate === null ? null : i.contributionRate * i.annualRevenue;
  const incomeTax = !i.liberatoire
    ? 0
    : i.liberatoireRate === null
      ? null
      : i.liberatoireRate * i.annualRevenue;
  const remaining =
    contributions === null || incomeTax === null
      ? null
      : i.annualRevenue - contributions - incomeTax;

  const alerts: MicroAlert[] = [];
  if (prorata === 0) {
    alerts.push({
      id: "start-later",
      level: "info",
      title: "Activité non commencée cette année",
      message: "La date de début est postérieure à l’année simulée.",
    });
  }
  if (ceilingUsage > 1) {
    alerts.push({
      id: "ceiling-exceeded",
      level: "alerte",
      title: "Plafond de la micro-entreprise dépassé",
      message:
        "Votre chiffre d’affaires dépasse le plafond de l’année. Un dépassement deux années de suite entraîne la sortie du régime : faites le point avec l’Urssaf ou un expert-comptable. [À VÉRIFIER — urssaf.fr]",
    });
  } else if (ceilingUsage >= APPROACH) {
    alerts.push({
      id: "ceiling-approaching",
      level: "attention",
      title: "Vous approchez du plafond",
      message: "Votre chiffre d’affaires atteint plus de 80 % du plafond de la micro-entreprise.",
    });
  }
  if (i.annualRevenue > t.vatThresholdIncreased) {
    alerts.push({
      id: "vat-increased-exceeded",
      level: "alerte",
      title: "Seuil majoré de franchise de TVA dépassé",
      message:
        "Vous devenez redevable de la TVA dès le dépassement, sans attendre l’année suivante. [À VÉRIFIER — impots.gouv.fr]",
    });
  } else if (i.annualRevenue > t.vatThreshold) {
    alerts.push({
      id: "vat-exceeded",
      level: "attention",
      title: "Seuil de franchise de TVA dépassé",
      message:
        "Vous dépassez le seuil sans atteindre le seuil majoré : la franchise est en principe maintenue cette année mais pas l’an prochain. [À VÉRIFIER — impots.gouv.fr]",
    });
  } else if (i.annualRevenue >= APPROACH * t.vatThreshold) {
    alerts.push({
      id: "vat-approaching",
      level: "info",
      title: "Vous approchez du seuil de franchise de TVA",
      message:
        "Votre chiffre d’affaires atteint plus de 80 % du seuil de franchise en base de TVA.",
    });
  }
  return { prorata, ceiling, ceilingUsage, contributions, incomeTax, remaining, alerts };
}
