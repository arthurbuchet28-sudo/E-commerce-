import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { findStep, parcoursSteps } from "@/data/parcours";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return parcoursSteps.map((s) => ({ etape: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/se-lancer/[etape]">): Promise<Metadata> {
  const step = findStep((await params).etape);
  if (!step) return {};
  return buildMetadata({
    title: `Étape ${step.number} : ${step.title}`,
    description: `Étape ${step.number} sur 8 du parcours « Se lancer » : ${step.title.toLowerCase()}. Objectif, guides, outil et checklist.`,
    path: `/se-lancer/${step.slug}`,
  });
}

export default async function StepPage({ params }: PageProps<"/se-lancer/[etape]">) {
  const step = findStep((await params).etape);
  if (!step) notFound();
  return (
    <Container>
      <PageHeader
        title={step.title}
        lead={`Étape ${step.number} sur ${parcoursSteps.length} du parcours « Se lancer ».`}
        crumbs={breadcrumbFor(`/se-lancer/${step.slug}`, `Étape ${step.number}`)}
      />
      <p className="rounded-ui border border-dashed border-border bg-sheet p-5 text-muted">
        Le contenu de cette étape est en cours de construction.
      </p>
    </Container>
  );
}
