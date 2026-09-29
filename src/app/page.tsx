import { Container } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { RouteStepper } from "@/components/ui/RouteStepper";
import { siteConfig } from "@/config/site";
import { parcoursSteps, stepHref } from "@/data/parcours";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

// Home skeleton: featured guides, tools, free course and newsletter arrive with their phases.
export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Container className="grid gap-12 py-12 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div className="flex flex-col gap-6">
          <h1 className="text-[2.125rem] leading-tight md:text-display">
            Passer de l’idée à la première vente en ligne, étape par étape
          </h1>
          <p className="max-w-prose font-serif text-lead">
            Un parcours gratuit en 8 étapes, des guides sourcés et des outils de calcul, pour lancer
            votre boutique en restant en règle avec le droit français. Sans promesse de revenus.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/se-lancer" size="lg">
              Commencer le parcours gratuit
            </ButtonLink>
            <ButtonLink href="/outils/quel-modele-ecommerce" variant="quiet">
              Faire le quiz : quel modèle pour moi ?
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-ui border border-line bg-sheet p-6">
          <h2 className="mb-5 text-h3">Le parcours « Se lancer »</h2>
          <RouteStepper
            label="Aperçu du parcours en 8 étapes"
            steps={parcoursSteps.map((s) => ({
              title: s.title,
              href: stepHref(s.slug),
              status: "todo",
            }))}
          />
        </div>
      </Container>

      <section aria-labelledby="methode-title" className="border-t border-line">
        <Container className="py-12">
          <h2 id="methode-title" className="mb-3 text-h2">
            Notre méthode
          </h2>
          <ul className="grid max-w-4xl gap-4 md:grid-cols-3">
            <li>
              <p className="font-semibold">Des sources officielles</p>
              <p className="text-muted">
                Chaque chiffre et chaque règle renvoient à leur source, avec une date de
                vérification.
              </p>
            </li>
            <li>
              <p className="font-semibold">Des contenus datés</p>
              <p className="text-muted">
                La date de mise à jour est affichée en haut de chaque guide.
              </p>
            </li>
            <li>
              <p className="font-semibold">Aucune promesse de gain</p>
              <p className="text-muted">
                {siteConfig.name} vous aide à décider et à agir, pas à rêver : les difficultés sont
                dites.
              </p>
            </li>
          </ul>
        </Container>
      </section>
    </>
  );
}
