import { connection, NextResponse } from "next/server";

import { overallState } from "@/lib/operations/checks";
import { collectStatus } from "@/lib/operations/status";

/**
 * Health check for an uptime monitor: 200 while the site and its database answer
 * (« ok » or « degraded »), 503 when the database is down. No detail is exposed.
 */
export async function GET() {
  await connection();
  const status = overallState(await collectStatus());
  return NextResponse.json(
    { status },
    { status: status === "down" ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
