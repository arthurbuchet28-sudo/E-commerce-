import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import { InvoiceDocument, type InvoiceSnapshot } from "@/lib/pdf/InvoiceDocument";
import { getUser } from "@/lib/supabase/server";

/** Member's invoice or credit note as a PDF (RLS: only invoices of their own orders). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse("Facture introuvable", { status: 404 });
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.redirect(new URL("/compte/connexion", request.url));
  const { data: invoice } = await supabase
    .from("invoices")
    .select("number, kind, issued_at, data")
    .eq("id", id.data)
    .maybeSingle();
  if (!invoice) return new NextResponse("Facture introuvable", { status: 404 });

  const doc = createElement(InvoiceDocument, {
    number: invoice.number,
    kind: invoice.kind as "invoice" | "credit_note",
    issuedAt: invoice.issued_at,
    data: invoice.data as unknown as InvoiceSnapshot,
  }) as unknown as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(doc);
  const prefix = invoice.kind === "invoice" ? "facture" : "avoir";
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${prefix}-${invoice.number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
