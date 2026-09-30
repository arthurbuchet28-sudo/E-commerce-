/**
 * Status page logic (pure, unit-tested): turns raw observations into a state per component.
 * Third-party services are checked for configuration only: calling Stripe or Brevo on every
 * visit of /statut would be slow and could hit their rate limits.
 */

export type CheckState = "ok" | "degraded" | "down" | "simulated";

export type Check = { id: string; label: string; state: CheckState; detail: string };

export type StatusInput = {
  database: "ok" | "down" | "not_configured";
  payments: "stripe" | "simulated";
  email: "brevo" | "local";
  video: "bunny" | "mock";
  monitoring: boolean;
  /** Last run of the daily job, if any. */
  dailyJob: { lastRunAt: Date; ok: boolean } | null;
  now: Date;
};

/** The daily job runs every 24 h: beyond this delay, something is wrong. */
export const DAILY_JOB_MAX_AGE_HOURS = 26;

const hoursBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 3_600_000;

function jobCheck(job: StatusInput["dailyJob"], now: Date): Check {
  const base = { id: "tache-quotidienne", label: "Tâche quotidienne (e-mails, purges)" };
  if (!job) return { ...base, state: "degraded", detail: "Jamais exécutée" };
  const age = hoursBetween(job.lastRunAt, now);
  const when = age < 1 ? "il y a moins d’une heure" : `il y a ${Math.floor(age)} h`;
  if (!job.ok) return { ...base, state: "degraded", detail: `En échec (${when})` };
  if (age > DAILY_JOB_MAX_AGE_HOURS) {
    return { ...base, state: "degraded", detail: `Dernière exécution ${when}` };
  }
  return { ...base, state: "ok", detail: `Dernière exécution ${when}` };
}

export function evaluateStatus(input: StatusInput): Check[] {
  const configured = (on: boolean, label: string, id: string): Check =>
    on
      ? { id, label, state: "ok", detail: "Opérationnel" }
      : { id, label, state: "simulated", detail: "environnement de test" };
  return [
    { id: "site", label: "Site et contenus", state: "ok", detail: "Opérationnel" },
    {
      id: "base",
      label: "Comptes et formations",
      state: input.database === "ok" ? "ok" : input.database === "down" ? "down" : "simulated",
      detail:
        input.database === "ok"
          ? "Opérationnel"
          : input.database === "down"
            ? "Indisponible"
            : "non configuré (environnement de test)",
    },
    configured(input.payments === "stripe", "Paiements", "paiements"),
    configured(input.email === "brevo", "E-mails", "emails"),
    configured(input.video === "bunny", "Vidéos des formations", "videos"),
    jobCheck(input.dailyJob, input.now),
    configured(input.monitoring, "Surveillance des erreurs", "surveillance"),
  ];
}

/** Worst state wins; simulated components do not count as incidents. */
export function overallState(checks: Check[]): "ok" | "degraded" | "down" {
  if (checks.some((c) => c.state === "down")) return "down";
  if (checks.some((c) => c.state === "degraded")) return "degraded";
  return "ok";
}
