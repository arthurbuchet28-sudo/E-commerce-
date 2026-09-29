import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { getRoute } from "@/config/routes";
import { formatEuros } from "@/lib/commerce/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { isSimulation } from "@/lib/services/payments";
import { createAdminClient } from "@/lib/supabase/admin";

import { simulatePayment } from "./actions";

export const metadata = pageMetadata("/paiement-simule");

/**
 * Stands in for Stripe Checkout when no Stripe account is configured (never in production).
 * It deliberately asks for no card data.
 */
export default async function SimulatedPaymentPage({
  searchParams,
}: PageProps<"/paiement-simule">) {
  if (!isSimulation()) notFound();
  const r = getRoute("/paiement-simule");
  const session = (await searchParams).session;
  const admin = createAdminClient();
  const { data: order } =
    admin && typeof session === "string" && /^cs_sim_[0-9a-f]{32}$/.test(session)
      ? await admin
          .from("orders")
          .select("reference, email, amount_cents, status, order_items(title, courses(slug))")
          .eq("stripe_session_id", session)
          .maybeSingle()
      : { data: null };
  const slug = (order?.order_items[0]?.courses as { slug: string } | null)?.slug;

  return (
    <Container className="max-w-xl">
      <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />
      <Callout type="attention" title="Mode démonstration">
        <p>
          Aucun compte Stripe n’est configuré : ce paiement est simulé et aucune carte n’est
          débitée. En production, cette étape se déroule sur la page sécurisée de Stripe.
        </p>
      </Callout>
      {!order || order.status !== "pending" ? (
        <p className="mt-6">
          Aucun paiement en attente.{" "}
          <Link href="/formations" className="link">
            Voir les formations
          </Link>
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4 rounded-ui border border-line bg-sheet p-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted">Commande</dt>
            <dd>{order.reference}</dd>
            <dt className="text-muted">Formation</dt>
            <dd>{order.order_items.map((i) => i.title).join(", ")}</dd>
            <dt className="text-muted">E-mail</dt>
            <dd className="break-all">{order.email}</dd>
            <dt className="text-muted">Montant</dt>
            <dd className="font-semibold">{formatEuros(order.amount_cents)}</dd>
          </dl>
          <form action={simulatePayment} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="session" value={session} />
            <Button type="submit" size="lg">
              Payer {formatEuros(order.amount_cents)}
            </Button>
            <Link
              href={`/commande/annulee${slug ? `?formation=${slug}` : ""}` as Route}
              className="link"
            >
              Annuler
            </Link>
          </form>
        </div>
      )}
    </Container>
  );
}
