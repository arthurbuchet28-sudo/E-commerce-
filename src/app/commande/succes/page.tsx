import type { Route } from "next";
import Link from "next/link";

import { AwaitConfirmation } from "@/components/commerce/AwaitConfirmation";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { withdrawalDays } from "@/config/legal";
import { getRoute } from "@/config/routes";
import { addDays, formatDateParis, formatEuros } from "@/lib/commerce/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { getUser } from "@/lib/supabase/server";

export const metadata = pageMetadata("/commande/succes");

/**
 * Return page after Stripe Checkout. It only READS the order: access is granted by the
 * webhook, never here.
 */
export default async function OrderSuccessPage({ searchParams }: PageProps<"/commande/succes">) {
  const r = getRoute("/commande/succes");
  const sessionId = (await searchParams).session_id;
  const { supabase, user } = await getUser();
  const { data: order } =
    supabase && user && typeof sessionId === "string" && /^cs_[A-Za-z0-9_]{8,200}$/.test(sessionId)
      ? await supabase
          .from("orders")
          .select(
            "id, reference, status, amount_cents, paid_at, immediate_access, order_items(title, courses(slug)), enrollments(starts_at)",
          )
          .eq("stripe_session_id", sessionId)
          .maybeSingle()
      : { data: null };

  const header = <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />;
  if (!order) {
    return (
      <Container className="max-w-3xl">
        {header}
        <p>
          Retrouvez vos commandes et vos factures dans{" "}
          <Link href="/compte" className="link">
            votre espace membre
          </Link>
          .
        </p>
      </Container>
    );
  }

  const item = order.order_items[0];
  const slug = (item?.courses as { slug: string } | null)?.slug;
  const startsAt = order.enrollments[0]?.starts_at;
  const now = new Date().toISOString();

  return (
    <Container className="max-w-3xl">
      {header}
      <div className="flex flex-col gap-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-ui border border-line bg-sheet p-6">
          <dt className="text-muted">Commande</dt>
          <dd className="font-semibold">{order.reference}</dd>
          <dt className="text-muted">Formation</dt>
          <dd>{item?.title}</dd>
          <dt className="text-muted">Montant</dt>
          <dd>{formatEuros(order.amount_cents)} TTC</dd>
        </dl>
        {order.status === "pending" || order.status === "expired" ? (
          <AwaitConfirmation />
        ) : order.status === "paid" ? (
          <>
            {startsAt && startsAt <= now ? (
              <Callout type="astuce" title="Votre accès est ouvert">
                <p className="mb-3">Vous pouvez commencer la formation dès maintenant.</p>
                <ButtonLink href={`/apprendre/${slug}` as Route}>Commencer la formation</ButtonLink>
              </Callout>
            ) : (
              <Callout type="info" title="Votre accès ouvrira bientôt">
                <p>
                  Votre accès ouvrira le {startsAt ? formatDateParis(startsAt) : "—"}, à la fin du
                  délai de rétractation. Jusqu’au{" "}
                  {order.paid_at ? formatDateParis(addDays(order.paid_at, withdrawalDays())) : "—"},
                  vous pouvez vous rétracter en ligne depuis la page{" "}
                  <Link href="/retractation" className="link">
                    Se rétracter
                  </Link>
                  .
                </p>
              </Callout>
            )}
            <p>
              Un e-mail de confirmation vous a été envoyé. Votre facture est disponible dans{" "}
              <Link href="/compte" className="link">
                votre espace membre
              </Link>
              . Conservez votre numéro de commande : il vous sera demandé pour une éventuelle
              rétractation.
            </p>
          </>
        ) : (
          <p>
            Cette commande a été annulée ou remboursée. Détails dans{" "}
            <Link href="/compte" className="link">
              votre espace membre
            </Link>
            .
          </p>
        )}
      </div>
    </Container>
  );
}
