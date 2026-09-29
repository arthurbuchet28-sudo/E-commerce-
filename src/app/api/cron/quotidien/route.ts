import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env.server";
import { CONSENT_PROOF_MONTHS } from "@/lib/consent/consent";
import { runNewsletterJob } from "@/lib/newsletter/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const newsletter = await runNewsletterJob(admin);
  const { data: consentProofsPurged } = await admin.rpc("purge_cookie_consents", {
    p_months: CONSENT_PROOF_MONTHS,
  });
  return NextResponse.json({ ...newsletter, consentProofsPurged });
}
