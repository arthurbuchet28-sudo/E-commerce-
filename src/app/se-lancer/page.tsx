import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { RouteStepper } from "@/components/ui/RouteStepper";
import { getRoute } from "@/config/routes";
import { parcoursSteps, stepHref } from "@/data/parcours";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/se-lancer");

export default function SeLancerPage() {
  const r = getRoute("/se-lancer");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <RouteStepper
        label="Les 8 étapes du parcours"
        steps={parcoursSteps.map((s) => ({
          title: s.title,
          href: stepHref(s.slug),
          status: "todo",
        }))}
      />
    </Container>
  );
}
