import Link from "next/link";

import { withdrawalDays } from "@/config/legal";
import { addDays, formatDateParis, formatEuros } from "@/lib/commerce/format";
import type { createClient } from "@/lib/supabase/server";

type Client = NonNullable<Awaited<ReturnType<typeof createClient>>>;

const statusLabels: Record<string, string> = {
  paid: "Payée",
  withdrawn: "Rétractée",
  refunded: "Remboursée",
};

export async function loadPurchases(supabase: Client) {
  const { data } = await supabase
    .from("orders")
    .select(
      "id, reference, status, amount_cents, paid_at, order_items(title), invoices(id, number, kind)",
    )
    .in("status", ["paid", "withdrawn", "refunded"])
    .order("paid_at", { ascending: false });
  return data ?? [];
}

type Purchases = Awaited<ReturnType<typeof loadPurchases>>;

export function PurchasesPanel({ purchases }: { purchases: Purchases }) {
  if (purchases.length === 0) {
    return <p className="text-muted">Aucun achat pour l’instant. Vos factures apparaîtront ici.</p>;
  }
  const now = new Date().toISOString();
  return (
    <ul className="flex flex-col divide-y divide-line">
      {purchases.map((o) => {
        const deadline = o.paid_at ? addDays(o.paid_at, withdrawalDays()) : null;
        return (
          <li key={o.id} className="flex flex-col gap-1 py-3 first:pt-0">
            <p className="font-semibold">{o.order_items.map((i) => i.title).join(", ")}</p>
            <p className="text-small text-muted">
              Commande {o.reference}
              {o.paid_at && ` · ${formatDateParis(o.paid_at)}`} · {formatEuros(o.amount_cents)} TTC
              · {statusLabels[o.status] ?? o.status}
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-small">
              {o.invoices
                .toSorted((a, b) => a.number.localeCompare(b.number))
                .map((inv) => (
                  <a key={inv.id} href={`/api/compte/factures/${inv.id}`} className="link" download>
                    {inv.kind === "invoice" ? "Facture" : "Avoir"} {inv.number} (PDF)
                  </a>
                ))}
              {o.status === "paid" && deadline && deadline > now && (
                <Link href="/retractation" className="link">
                  Se rétracter (jusqu’au {formatDateParis(deadline)})
                </Link>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
