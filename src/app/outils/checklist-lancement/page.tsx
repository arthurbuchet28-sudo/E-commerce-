import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { LaunchChecklist } from "@/components/tools/LaunchChecklist";
import { ToolSections } from "@/components/tools/ToolSections";
import { getRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils/checklist-lancement");

export default function ChecklistPage() {
  const r = getRoute("/outils/checklist-lancement");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <LaunchChecklist siteName={siteConfig.name} />
      <ToolSections
        method={
          <p>
            Les points sont regroupés par thème, dans l’ordre où ils se présentent le plus souvent.
            Cochez ce qui est fait ; le PDF reprend l’état de votre checklist au jour du
            téléchargement.
          </p>
        }
        hypotheses={[
          "La liste couvre les obligations et les bonnes pratiques d’une petite boutique qui vend à des particuliers en France.",
          "Certaines activités (alimentaire, cosmétiques, produits réglementés) ont des obligations supplémentaires.",
        ]}
        guide={{ category: "legal-et-conformite", slug: "mentions-legales-site-e-commerce" }}
      />
    </Container>
  );
}
