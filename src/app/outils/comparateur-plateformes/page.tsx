import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/components/mdx/components";
import { PlatformComparator } from "@/components/tools/PlatformComparator";
import { ToolSections } from "@/components/tools/ToolSections";
import { getRoute } from "@/config/routes";
import { platforms } from "@/data/platforms";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils/comparateur-plateformes");

export default function ComparatorPage() {
  const r = getRoute("/outils/comparateur-plateformes");
  const checked = platforms.map((p) => p.checkedAt).sort()[0];
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <PlatformComparator />
      <ToolSections
        method={
          <>
            <p>
              Chaque solution est décrite selon les mêmes critères : modèle, coûts, difficulté de
              prise en main, possibilités de personnalisation, référencement, extensions et
              hébergement. Les niveaux (faible, moyenne, élevée) sont une appréciation éditoriale.
            </p>
            <p>
              Les tarifs changent souvent : nous ne les recopions pas. Consultez la page tarifs
              officielle de chaque solution et additionnez abonnement, commissions, extensions et
              frais de paiement.
            </p>
          </>
        }
        hypotheses={[
          "Aucune solution n’est « la meilleure » : la bonne dépend de votre profil et de votre budget.",
          "Aucun lien affilié : les liens mènent aux sites officiels, sans rémunération par clic.",
          "Les appréciations portent sur un usage débutant.",
        ]}
        dataNote={
          <p>
            Informations vérifiées le {formatDate(checked)}. Tarifs à vérifier sur les sites
            officiels.
          </p>
        }
        guide={{ category: "plateformes-et-boutique", slug: "comparatif-plateformes" }}
      />
    </Container>
  );
}
