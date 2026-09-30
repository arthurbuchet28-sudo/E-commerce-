import { NextResponse, type NextRequest } from "next/server";

import { CLIENT_ERROR_MAX_BYTES, clientErrorSchema } from "@/lib/monitoring/client-report";
import { reportError } from "@/lib/monitoring/report";
import { scrubText } from "@/lib/monitoring/scrub";
import { isSameOrigin } from "@/lib/security/origin";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Browser errors caught by the error pages, forwarded to the monitoring service (the Sentry
 * browser SDK is not shipped). Same origin only, small bodies, rate-limited per visitor.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new NextResponse(null, { status: 403 });
  const raw = await request.text();
  if (raw.length > CLIENT_ERROR_MAX_BYTES) return new NextResponse(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = clientErrorSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const admin = createAdminClient();
  if (
    admin &&
    !(await withinRateLimit(admin, "erreurs", "", {
      perEmail: 20,
      perVisitor: 20,
      windowSeconds: 3600,
    }))
  ) {
    return new NextResponse(null, { status: 429 });
  }

  const error = new Error(scrubText(parsed.data.message));
  error.name = parsed.data.name.replace(/[^\w]/g, "").slice(0, 60) || "Error";
  await reportError(error, { source: "client", path: parsed.data.path });
  return new NextResponse(null, { status: 204 });
}
