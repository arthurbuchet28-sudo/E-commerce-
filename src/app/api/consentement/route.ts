import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { CONSENT_PURPOSES, CONSENT_VERSION } from "@/lib/consent/consent";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const ids = CONSENT_PURPOSES.map((p) => p.id);
const bodySchema = z.object({
  visitorId: z.uuid(),
  version: z.literal(CONSENT_VERSION),
  choices: z
    .record(z.string(), z.boolean())
    .refine((c) => Object.keys(c).every((k) => ids.includes(k)), "Unknown purpose"),
});

/** Proof of a decision on trackers (identifier, choices, version, date; no IP address). */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || ids.length === 0) return new NextResponse(null, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return new NextResponse(null, { status: 503 });
  const ok = await withinRateLimit(admin, "consentement", parsed.data.visitorId, {
    perEmail: 20,
    perVisitor: 60,
    windowSeconds: 3600,
  });
  if (!ok) return new NextResponse(null, { status: 429 });
  const { error } = await admin.from("cookie_consents").insert({
    visitor_id: parsed.data.visitorId,
    version: parsed.data.version,
    choices: parsed.data.choices,
  });
  return new NextResponse(null, { status: error ? 500 : 204 });
}
