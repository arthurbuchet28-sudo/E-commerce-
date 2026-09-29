import { NextResponse, type NextRequest } from "next/server";

import { unsubscribe } from "@/lib/newsletter/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function run(request: NextRequest): Promise<boolean | null> {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const admin = createAdminClient();
  if (!admin) return null;
  return unsubscribe(admin, token);
}

/** Link in the e-mail footer: unsubscribes in one click, then shows the result page. */
export async function GET(request: NextRequest) {
  const done = await run(request);
  const status = done === null ? "erreur" : done ? "ok" : "inconnu";
  return NextResponse.redirect(
    new URL(`/newsletter/desinscription?statut=${status}`, request.url),
    303,
  );
}

/** RFC 8058 one-click unsubscribe, sent by the mail client (List-Unsubscribe-Post). */
export async function POST(request: NextRequest) {
  const done = await run(request);
  return new NextResponse(null, { status: done === null ? 503 : 200 });
}
