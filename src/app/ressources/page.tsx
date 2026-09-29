import type { Route } from "next";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { ButtonLink } from "@/components/ui/Button";
import { getRoute } from "@/config/routes";
import { LEAD_MAGNET_COUNT, LEAD_MAGNET_TITLE } from "@/data/newsletter";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/ressources");

export default function ResourcesPage() {
  const r = getRoute("/ressources");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section
          aria-labelledby="checklist-title"
          className="flex flex-col gap-4 rounded-ui border border-line bg-sheet p-6"
        >
          <h2 id="checklist-title" className="text-h2">
            {LEAD_MAGNET_TITLE}
          </h2>
          <p>
            Les {LEAD_MAGNET_COUNT} points à vérifier avant d’ouvrir : statut, obligations légales
            du site, prix, paiement, livraison et retours. Une page à imprimer et à cocher.
          </p>
          <p>
            Recevez-la par e-mail en vous inscrivant à la newsletter. Vous confirmez votre adresse
            d’un clic, puis la checklist arrive aussitôt.
          </p>
          <NewsletterForm source="ressources" idPrefix="ressources" />
        </section>

        <section aria-labelledby="libre-title" className="flex flex-col gap-4">
          <h2 id="libre-title" className="text-h3">
            En accès libre
          </h2>
          <div className="flex flex-col gap-3 rounded-ui border border-line bg-sheet p-5">
            <h3 className="font-semibold">Checklist de lancement complète</h3>
            <p className="text-small text-muted">
              La version interactive, à cocher en ligne et à exporter en PDF.
            </p>
            <div>
              <ButtonLink href="/outils/checklist-lancement" variant="secondary">
                Ouvrir la checklist
              </ButtonLink>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-ui border border-line bg-sheet p-5">
            <h3 className="font-semibold">Plan d’action sur 30 jours</h3>
            <p className="text-small text-muted">
              Fourni avec la formation gratuite « Les bases du e-commerce » (compte gratuit).
            </p>
            <div>
              <ButtonLink href={"/formations/les-bases-du-e-commerce" as Route} variant="secondary">
                Voir la formation
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
