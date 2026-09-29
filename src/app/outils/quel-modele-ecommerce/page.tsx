import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { ModelQuiz } from "@/components/tools/ModelQuiz";
import { ToolSections } from "@/components/tools/ToolSections";
import { getRoute } from "@/config/routes";
import { getGuide } from "@/lib/content/guides";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils/quel-modele-ecommerce");

export default function QuizPage() {
  const r = getRoute("/outils/quel-modele-ecommerce");
  const guide = getGuide("idee-et-produit", "les-6-modeles-de-e-commerce");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <ModelQuiz guide={guide ? { title: guide.title, href: guide.href } : null} />
      <ToolSections
        method={
          <p>
            Chaque réponse donne des points aux modèles qui conviennent à votre situation : budget,
            temps disponible, rapport au stock, compétences. Le modèle qui totalise le plus de
            points est recommandé ; en cas d’égalité, le moins risqué financièrement passe en
            premier.
          </p>
        }
        hypotheses={[
          "Six modèles sont comparés : stock, dropshipping, print-on-demand, artisanat, revente et produits numériques.",
          "La pondération des réponses est éditoriale : elle oriente, elle ne prédit pas.",
          "Vos réponses restent dans votre navigateur : rien n’est envoyé ni enregistré.",
        ]}
        guide={{ category: "idee-et-produit", slug: "les-6-modeles-de-e-commerce" }}
      />
    </Container>
  );
}
