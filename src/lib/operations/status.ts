import "server-only";

import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

import { evaluateStatus, type StatusInput } from "./checks";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

/** Records the outcome of a scheduled job (counters only). Never throws. */
export async function recordJobRun(
  admin: Admin,
  job: string,
  ok: boolean,
  summary: Record<string, Json | undefined>,
) {
  await admin
    .from("job_runs")
    .upsert({
      job,
      ok,
      summary: JSON.parse(JSON.stringify(summary)) as { [key: string]: Json },
      last_run_at: new Date().toISOString(),
    })
    .then(
      () => undefined,
      () => undefined,
    );
}

const TIMEOUT_MS = 3000;

/** Observes the platform for /statut and /api/sante. */
export async function collectStatus(now = new Date()) {
  const env = serverEnv();
  const admin = createAdminClient();
  let database: StatusInput["database"] = "not_configured";
  let dailyJob: StatusInput["dailyJob"] = null;
  if (admin) {
    const { data, error } = await admin
      .from("job_runs")
      .select("last_run_at, ok")
      .eq("job", "quotidien")
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
      .maybeSingle()
      .then(
        (r) => r,
        () => ({ data: null, error: new Error("timeout") }),
      );
    database = error ? "down" : "ok";
    if (data) dailyJob = { lastRunAt: new Date(data.last_run_at), ok: data.ok };
  }
  return evaluateStatus({
    database,
    payments: env.STRIPE_SECRET_KEY ? "stripe" : "simulated",
    email: env.EMAIL_PROVIDER === "brevo" ? "brevo" : "local",
    video: env.VIDEO_PROVIDER,
    monitoring: Boolean(env.SENTRY_DSN),
    dailyJob,
    now,
  });
}
