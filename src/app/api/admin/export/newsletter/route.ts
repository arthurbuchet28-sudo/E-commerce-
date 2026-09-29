import { NextResponse } from "next/server";

import { adminOrNull } from "@/lib/admin/auth";
import { toCsv } from "@/lib/admin/schemas";

/** Confirmed newsletter subscribers as CSV (admins only, never the unsubscribe tokens). */
export async function GET() {
  const admin = await adminOrNull();
  if (!admin) return new NextResponse("Not found", { status: 404 });
  const { data, error } = await admin.supabase
    .from("newsletter_subscribers")
    .select("email, source, confirmed_at, consent_text_version")
    .eq("status", "confirmed")
    .order("confirmed_at");
  if (error) return new NextResponse("Export impossible", { status: 500 });
  const csv = toCsv(
    ["email", "origine", "confirme_le", "version_consentement"],
    data.map((s) => [s.email, s.source, s.confirmed_at, s.consent_text_version]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-abonnes-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
