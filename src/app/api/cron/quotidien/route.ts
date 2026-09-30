import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env.server";
import { CONSENT_PROOF_MONTHS } from "@/lib/consent/consent";
import { CONTACT_RETENTION_MONTHS } from "@/lib/contact/topics";
import { reportError } from "@/lib/monitoring/report";
import { runNewsletterJob } from "@/lib/newsletter/server";
import { recordJobRun } from "@/lib/operations/status";
import { createAdminClient } from "@/lib/supabase/admin";

const JOB = "quotidien";

function authorized(request: NextRequest): boolean {
  const env = serverEnv();
  // Local development only: no secret configured (required elsewhere, see src/lib/env.ts).
  if (!env.CRON_SECRET) return env.APP_ENV === "local";
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Daily job (vercel.json): welcome sequence e-mails and data retention (purges). */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  try {
    const newsletter = await runNewsletterJob(admin);
    const { data: consentProofsPurged } = await admin.rpc("purge_cookie_consents", {
      p_months: CONSENT_PROOF_MONTHS,
    });
    const { data: contactMessagesPurged } = await admin.rpc("purge_contact_messages", {
      p_months: CONTACT_RETENTION_MONTHS,
    });
    const summary = { ...newsletter, consentProofsPurged, contactMessagesPurged };
    await recordJobRun(admin, JOB, !newsletter.failed, summary);
    return NextResponse.json(summary);
  } catch (error) {
    await recordJobRun(admin, JOB, false, {});
    await reportError(error, { source: "server", path: request.nextUrl.pathname });
    return NextResponse.json({ error: "job_failed" }, { status: 500 });
  }
}
