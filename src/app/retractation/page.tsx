import Link from "next/link";

import { WithdrawalForm } from "@/components/commerce/WithdrawalForm";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { refundDays, withdrawalDays } from "@/config/legal";
import { getRoute } from "@/config/routes";
import { formatRef, getRef } from "@/data/reference";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/retractation");

export default function WithdrawalPage() {
  const r = getRoute("/retractation");
  const since = getRef("conso.fonctionRetractationDate");
  return (
    <Container className="max-w-3xl">
      <PageHeader
        title={r.h1}
        lead={`Vous avez acheté une formation il y a moins de ${withdrawalDays()} jours ? Vous pouvez vous rétracter ici, sans vous connecter et sans avoir à vous justifier.`}
        crumbs={breadcrumbFor(r.path, r.label)}
      />
      <div className="flex flex-col gap-10">
        <WithdrawalForm withdrawalDays={withdrawalDays()} />

        <section aria-labelledby="fonctionnement-title" className="flex flex-col gap-3">
          <h2 id="fonctionnement-title" className="text-h2">
            Comment ça se passe
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Vous indiquez votre nom, l’adresse e-mail utilisée pour la commande et le numéro de
              commande (PV-…) figurant dans l’e-mail de confirmation.
            </li>
            <li>Vous vérifiez la commande, puis vous confirmez la rétractation.</li>
            <li>
              Vous recevez aussitôt un accusé de réception par e-mail. Votre accès à la formation
              est fermé.
            </li>
            <li>
              Vous êtes remboursé, sans frais, sur le moyen de paiement utilisé, au plus tard{" "}
              {refundDays()}&nbsp;jours après votre rétractation.
            </li>
          </ol>
        </section>

        <Callout type="legal" title="Le cas de l’accès immédiat">
          <p>
            Une formation en ligne est un contenu numérique. Si, lors de l’achat, vous avez demandé
            à y accéder immédiatement en renonçant expressément à votre droit de rétractation,
            celui-ci prend fin dès que vous avez commencé la formation (ouverture d’une première
            leçon). Tant que vous ne l’avez pas commencée, vous pouvez vous rétracter.
          </p>
        </Callout>

        <p className="text-small text-muted">
          {since.label} {formatRef(since)} ({since.source.name}). Les modalités sont détaillées dans
          les{" "}
          <Link href="/cgv" className="link">
            conditions générales de vente
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
