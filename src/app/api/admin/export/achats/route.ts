import { NextResponse } from "next/server";

import { adminOrNull } from "@/lib/admin/auth";
import { toCsv } from "@/lib/admin/schemas";

/** Paid, withdrawn and refunded orders as CSV, for bookkeeping (admins only). */
export async function GET() {
  const admin = await adminOrNull();
  if (!admin) return new NextResponse("Not found", { status: 404 });
  const { data, error } = await admin.supabase
    .from("orders")
    .select(
      "reference, paid_at, email, customer_name, amount_cents, status, immediate_access, waiver_at, order_items(title), invoices(number, kind)",
    )
    .in("status", ["paid", "withdrawn", "refunded"])
    .order("paid_at");
  if (error) return new NextResponse("Export impossible", { status: 500 });
  const csv = toCsv(
    [
      "commande",
      "payee_le",
      "email",
      "nom",
      "formations",
      "montant_ttc",
      "statut",
      "facture",
      "avoir",
      "renonciation_le",
    ],
    data.map((o) => [
      o.reference,
      o.paid_at,
      o.email,
      o.customer_name,
      o.order_items.map((i) => i.title).join(" / "),
      (o.amount_cents / 100).toFixed(2).replace(".", ","),
      o.status,
      o.invoices.find((i) => i.kind === "invoice")?.number,
      o.invoices.find((i) => i.kind === "credit_note")?.number,
      o.immediate_access ? o.waiver_at : "",
    ]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
