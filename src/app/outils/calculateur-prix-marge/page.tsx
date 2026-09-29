import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { PricingCalculator } from "@/components/tools/PricingCalculator";
import { ToolSections } from "@/components/tools/ToolSections";
import { getRoute } from "@/config/routes";
import { formatRef, getRef, type RefKey } from "@/data/reference";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils/calculateur-prix-marge");

const VAT_KEYS: RefKey[] = [
  "tva.tauxNormal",
  "tva.tauxIntermediaire",
  "tva.tauxReduit",
  "tva.tauxParticulier",
];

export default function PricingPage() {
  const r = getRoute("/outils/calculateur-prix-marge");
  const vatOptions = VAT_KEYS.map((k) => {
    const ref = getRef(k);
    return {
      value: ref.value as number,
      label: `${formatRef(ref)} (${ref.label.replace("Taux ", "").replace(" de TVA", "")})`,
    };
  });
  const social = getRef("micro.tauxCotisationsVente").value as number | null;

  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <PricingCalculator vatOptions={vatOptions} defaultSocialRate={social} />
      <ToolSections
        method={
          <>
            <p>
              On part de ce que paie le client (prix et frais de port facturés), on retire la TVA si
              vous y êtes assujetti, puis chacun de vos coûts par commande : produit, emballage,
              transport, commission et frais de paiement. Ce qui reste est la{" "}
              <strong>marge sur coûts variables</strong>.
            </p>
            <p>
              On en déduit les cotisations sociales, calculées sur le chiffre d’affaires hors
              taxes : c’est la <strong>marge nette par commande</strong>, avant vos charges fixes
              (abonnements, publicité).
            </p>
            <p>
              Le <strong>prix minimum</strong> est le prix TTC pour lequel cette marge nette vaut
              zéro. En dessous, chaque vente vous fait perdre de l’argent.
            </p>
            <p>
              Le <strong>taux de marge</strong> rapporte la marge brute au coût d’achat ; le{" "}
              <strong>taux de marque</strong> la rapporte au prix de vente HT ; le{" "}
              <strong>coefficient multiplicateur</strong> est le prix TTC divisé par le coût
              d’achat.
            </p>
          </>
        }
        hypotheses={[
          "Les montants payés par le client sont TTC.",
          "En franchise de TVA, saisissez vos coûts tels que vous les payez ; si vous êtes assujetti, saisissez-les hors taxes.",
          "La commission et les frais de paiement s’appliquent au total payé par le client.",
          "Une commande contient un seul produit.",
          "Les charges fixes (abonnements, publicité) ne sont pas incluses : utilisez le calculateur de seuil de rentabilité.",
        ]}
        refs={[...VAT_KEYS, "micro.tauxCotisationsVente"]}
        guide={{ category: "idee-et-produit", slug: "les-6-modeles-de-e-commerce" }}
      />
    </Container>
  );
}
