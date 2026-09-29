import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env.server";
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

/** Daily job (vercel.json): welcome sequence e-mails and newsletter data retention. */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  return NextResponse.json(await runNewsletterJob(admin));
}
