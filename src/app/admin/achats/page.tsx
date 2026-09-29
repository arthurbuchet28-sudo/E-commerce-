import type { Route } from "next";
import Link from "next/link";

import { retryRefund } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateParis, formatEuros } from "@/lib/commerce/format";
import { serverEnv } from "@/lib/env.server";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/admin/achats");

const statusLabels: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  expired: "Abandonnée",
  withdrawn: "Rétractée",
  refunded: "Remboursée",
};
const refundLabels: Record<string, string> = {
  pending: "remboursement en cours",
  succeeded: "remboursée",
  failed: "remboursement échoué",
};

const FILTERS = ["paid", "withdrawn", "refunded", "pending", "expired"] as const;

/** Link to the payment in the Stripe dashboard (none for simulated payments). */
function stripeUrl(paymentIntent: string | null): string | null {
  if (!paymentIntent || !paymentIntent.startsWith("pi_") || paymentIntent.startsWith("pi_sim_"))
    return null;
  const test = serverEnv().STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? true;
  return `https://dashboard.stripe.com/${test ? "test/" : ""}payments/${paymentIntent}`;
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/achats">) {
  const r = getRoute("/admin/achats");
  const { supabase } = await requireAdmin(r.path);
  const statut = (await searchParams).statut;
  const filter = FILTERS.find((f) => f === statut);
  let query = supabase
    .from("orders")
    .select(
      "id, reference, email, customer_name, status, amount_cents, immediate_access, created_at, paid_at, stripe_payment_intent, order_items(title), invoices(id, number, kind), withdrawals(id, requested_at, refund_status)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  query = filter
    ? query.eq("status", filter)
    : query.in("status", ["paid", "withdrawn", "refunded"]);
  const { data: orders } = await query;

  return (
    <>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Filtrer les commandes">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-small">
              <li>
                <Link
                  href="/admin/achats"
                  className="link"
                  aria-current={!filter ? "page" : undefined}
                >
                  Payées, rétractées et remboursées
                </Link>
              </li>
              {FILTERS.map((f) => (
                <li key={f}>
                  <Link
                    href={`/admin/achats?statut=${f}` as Route}
                    className="link"
                    aria-current={filter === f ? "page" : undefined}
                  >
                    {statusLabels[f]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a href="/api/admin/export/achats" className="link font-semibold" download>
            Exporter les commandes (CSV)
          </a>
        </div>
        <p role="status">
          {orders?.length ?? 0} commande(s) affichée(s), les 200 plus récentes au plus.
        </p>
        <ul className="flex flex-col divide-y divide-line rounded-ui border border-line bg-sheet">
          {(orders ?? []).map((o) => {
            const w = o.withdrawals;
            const url = stripeUrl(o.stripe_payment_intent);
            return (
              <li key={o.id} className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {o.reference} · {o.order_items.map((i) => i.title).join(", ")}
                  </p>
                  <p>{formatEuros(o.amount_cents)} TTC</p>
                </div>
                <p className="text-small text-muted">
                  {o.customer_name ? `${o.customer_name} · ` : ""}
                  {o.email} · {statusLabels[o.status] ?? o.status}
                  {o.paid_at
                    ? ` le ${formatDateParis(o.paid_at)}`
                    : ` · créée le ${formatDateParis(o.created_at)}`}
                  {o.status !== "pending" && o.status !== "expired"
                    ? o.immediate_access
                      ? " · accès immédiat avec renonciation"
                      : " · accès différé (sans renonciation)"
                    : ""}
                  {w &&
                    ` · rétractation du ${formatDateParis(w.requested_at)} (${refundLabels[w.refund_status]})`}
                </p>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-small">
                  {o.invoices.map((inv) => (
                    <a
                      key={inv.id}
                      href={`/api/compte/factures/${inv.id}`}
                      className="link"
                      download
                    >
                      {inv.kind === "invoice" ? "Facture" : "Avoir"} {inv.number}
                    </a>
                  ))}
                  {url && (
                    <a href={url} className="link" target="_blank" rel="noopener noreferrer">
                      Voir dans Stripe (nouvel onglet)
                    </a>
                  )}
                </p>
                {w && w.refund_status !== "succeeded" && (
                  <ActionForm
                    action={retryRefund}
                    submitLabel="Relancer le remboursement"
                    variant="secondary"
                  >
                    <input type="hidden" name="withdrawalId" value={w.id} />
                  </ActionForm>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
