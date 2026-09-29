import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import { createElement, type ReactElement } from "react";

import { siteConfig } from "@/config/site";
import { LEAD_MAGNET_TITLE, leadMagnetGroups } from "@/data/newsletter";
import { ChecklistDocument } from "@/lib/pdf/ChecklistDocument";
import { createAdminClient } from "@/lib/supabase/admin";

/** Lead magnet PDF, for addresses that confirmed their subscription (link sent by e-mail). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const admin = createAdminClient();
  if (!admin || !/^[0-9a-f]{48}$/.test(token)) {
    return new NextResponse("Lien invalide", { status: 404 });
  }
  const { data } = await admin
    .from("newsletter_subscribers")
    .select("confirmed_at")
    .eq("access_token", token)
    .maybeSingle();
  if (!data?.confirmed_at) return new NextResponse("Lien invalide", { status: 404 });

  const date = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(new Date());
  const doc = createElement(ChecklistDocument, {
    groups: leadMagnetGroups(),
    checked: new Set<string>(),
    siteName: siteConfig.name,
    date,
    title: LEAD_MAGNET_TITLE,
  }) as unknown as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="checklist-25-points-avant-ouverture.pdf"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
