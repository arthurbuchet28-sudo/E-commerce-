import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { MicroSimulator } from "@/components/tools/MicroSimulator";
import { ToolSections } from "@/components/tools/ToolSections";
import { getRoute } from "@/config/routes";
import { getRef, type RefKey } from "@/data/reference";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils/simulateur-micro-entreprise");

const n = (k: RefKey) => getRef(k).value as number;
const rate = (k: RefKey) => {
  const v = getRef(k).value as number | null;
  return v === null ? null : v / 100;
};

export default function MicroPage() {
  const r = getRoute("/outils/simulateur-micro-entreprise");
  // Build-time year; the page is rebuilt with each deployment.
  const year = new Date().getFullYear();
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <MicroSimulator
        year={year}
        thresholds={{
          vente: {
            ceiling: n("micro.plafondVente"),
            vatThreshold: n("tva.franchiseVentes"),
            vatThresholdIncreased: n("tva.franchiseVentesMajore"),
          },
          services: {
            ceiling: n("micro.plafondServices"),
            vatThreshold: n("tva.franchiseServices"),
            vatThresholdIncreased: n("tva.franchiseServicesMajore"),
          },
        }}
        contributionRates={{
          vente: rate("micro.tauxCotisationsVente"),
          services: rate("micro.tauxCotisationsServices"),
        }}
        liberatoireRates={{
          vente: rate("micro.tauxVersementLiberatoireVente"),
          services: rate("micro.tauxVersementLiberatoireServices"),
        }}
      />
      <ToolSections
        method={
          <>
            <p>
              En micro-entreprise, les cotisations sociales sont un pourcentage du chiffre
              d’affaires encaissé. Si vous avez opté pour le versement libératoire, l’impôt sur le
              revenu est lui aussi un pourcentage du chiffre d’affaires.
            </p>
            <p>
              L’année de création, le plafond de la micro-entreprise est calculé au prorata du
              nombre de jours d’activité dans l’année.
            </p>
            <p>
              Les alertes se déclenchent à partir de 80 % du plafond ou du seuil de franchise de
              TVA, puis en cas de dépassement du seuil et du seuil majoré.
            </p>
          </>
        }
        hypotheses={[
          "Le chiffre d’affaires saisi est encaissé et hors taxes.",
          "Une seule activité à la fois : les activités mixtes ne sont pas simulées.",
          "Les seuils de franchise de TVA ne sont pas proratisés l’année de création [À VÉRIFIER — impots.gouv.fr].",
          "Le « reste » n’est pas un bénéfice : vos achats, frais et abonnements ne sont pas déduits.",
          "Les contributions annexes (formation professionnelle, taxes consulaires) ne sont pas incluses.",
        ]}
        refs={[
          "micro.plafondVente",
          "micro.plafondServices",
          "tva.franchiseVentes",
          "tva.franchiseVentesMajore",
          "tva.franchiseServices",
          "tva.franchiseServicesMajore",
          "micro.tauxCotisationsVente",
          "micro.tauxCotisationsServices",
          "micro.tauxVersementLiberatoireVente",
          "micro.tauxVersementLiberatoireServices",
        ]}
        guide={{ category: "statut-et-creation", slug: "micro-entreprise-plafonds-tva-seuils" }}
      />
    </Container>
  );
}
