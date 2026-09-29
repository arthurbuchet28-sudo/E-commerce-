import { Suspense } from "react";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { BreakEvenCalculator } from "@/components/tools/BreakEvenCalculator";
import { ToolLoading } from "@/components/tools/ToolLoading";
import { ToolSections } from "@/components/tools/ToolSections";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils/seuil-de-rentabilite");

export default function BreakEvenPage() {
  const r = getRoute("/outils/seuil-de-rentabilite");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <Suspense fallback={<ToolLoading />}>
        <BreakEvenCalculator />
      </Suspense>
      <ToolSections
        method={
          <>
            <p>
              Chaque vente dégage une marge, une fois payés ses coûts propres (produit, livraison,
              commissions, cotisations). Vos charges fixes, elles, tombent chaque mois quel que soit
              le nombre de ventes.
            </p>
            <p>
              Le seuil de rentabilité est le nombre de ventes pour lequel la somme des marges couvre
              les charges fixes : <strong>charges fixes ÷ marge par vente</strong>, arrondi à la
              vente supérieure.
            </p>
          </>
        }
        hypotheses={[
          "La marge par vente est la même pour toutes les ventes.",
          "Les charges fixes ne changent pas avec le volume de ventes.",
          "Votre propre rémunération n’est pas incluse : ajoutez-la aux charges fixes pour en tenir compte.",
          "Un mois compte environ 4,33 semaines.",
        ]}
        guide={{ category: "gestion-et-chiffres", slug: "indicateurs-a-suivre" }}
      />
    </Container>
  );
}
