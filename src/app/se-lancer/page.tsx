import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { ParcoursOverview } from "@/components/parcours/ParcoursOverview";
import { ResetProgress } from "@/components/parcours/ResetProgress";
import { getRoute } from "@/config/routes";
import { parcoursSteps } from "@/data/parcours";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/se-lancer");

export default function SeLancerPage() {
  const r = getRoute("/se-lancer");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="etapes-title"
          className="rounded-ui border border-line bg-sheet p-6"
        >
          <h2 id="etapes-title" className="mb-5 text-h3">
            Les {parcoursSteps.length} étapes
          </h2>
          <ParcoursOverview label="Les 8 étapes du parcours" />
        </section>
        <aside className="flex flex-col gap-4">
          <h2 className="text-h3">Comment ça marche</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Ouvrez une étape pour voir son objectif, sa durée indicative et ce que vous aurez à la
              fin.
            </li>
            <li>Lisez les guides liés et utilisez l’outil proposé.</li>
            <li>Cochez la checklist : l’étape est terminée quand tous les points le sont.</li>
          </ol>
          <p className="text-small text-muted">
            Votre progression est enregistrée dans ce navigateur, sans compte ni cookie. Avec un
            compte (bientôt disponible), elle vous suivra sur tous vos appareils.
          </p>
          <div>
            <ResetProgress />
          </div>
        </aside>
      </div>
    </Container>
  );
}
