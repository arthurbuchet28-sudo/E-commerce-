import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GuideList } from "@/components/content/GuideList";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { StepChecklist } from "@/components/parcours/StepChecklist";
import { findRoute } from "@/config/routes";
import { findStep, parcoursOutline, parcoursSteps, stepHref } from "@/data/parcours";
import { getGuide } from "@/lib/content/guides";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return parcoursSteps.map((s) => ({ etape: s.slug }));
}

type Props = PageProps<"/se-lancer/[etape]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const step = findStep((await params).etape);
  if (!step) return {};
  return buildMetadata({
    title: `Étape ${step.number} : ${step.title}`,
    description: `Étape ${step.number} sur 8 du parcours « Se lancer ». ${step.objective}`.slice(
      0,
      155,
    ),
    path: stepHref(step.slug),
  });
}

export default async function StepPage({ params }: Props) {
  const step = findStep((await params).etape);
  if (!step) notFound();

  const crumbs = breadcrumbFor(stepHref(step.slug), `Étape ${step.number}`);
  const written = step.guides
    .map((g) => getGuide(g.category, g.slug))
    .filter((g) => g !== undefined);
  const planned = step.guides.filter((g) => !getGuide(g.category, g.slug));
  const tool = step.tool ? findRoute(step.tool) : undefined;
  const prev = parcoursSteps[step.number - 2];
  const next = parcoursSteps[step.number];

  return (
    <Container>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHeader
        title={step.title}
        lead={`Étape ${step.number} sur ${parcoursSteps.length} du parcours « Se lancer ».`}
        crumbs={crumbs}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="objectif-title" className="flex flex-col gap-4">
            <h2 id="objectif-title" className="sr-only">
              Objectif et durée
            </h2>
            <dl className="grid gap-4 rounded-ui border border-line bg-sheet p-5 sm:grid-cols-[auto_1fr] sm:gap-x-6">
              <dt className="font-semibold">Objectif</dt>
              <dd>{step.objective}</dd>
              <dt className="font-semibold">Durée indicative</dt>
              <dd>{step.duration}</dd>
            </dl>
          </section>

          <section aria-labelledby="livrables-title" className="flex flex-col gap-3">
            <h2 id="livrables-title" className="text-h2">
              À la fin, vous aurez…
            </h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 font-serif text-body">
              {step.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="guides-title" className="flex flex-col gap-4">
            <h2 id="guides-title" className="text-h2">
              Les guides de cette étape
            </h2>
            {written.length > 0 && <GuideList guides={written} />}
            {planned.length > 0 && (
              <div>
                <h3 className="mb-2 font-sans text-ui font-semibold text-text">À paraître</h3>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
                  {planned.map((g) => (
                    <li key={g.slug}>{g.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <StepChecklist outline={parcoursOutline()} slug={step.slug} items={step.checklist} />
          {tool && (
            <div className="rounded-ui border border-line bg-sheet p-5">
              <p className="mb-1 text-small text-muted">Outil lié</p>
              <Link href={tool.path} className="link font-semibold">
                {tool.label}
              </Link>
              <p className="mt-1 text-small text-muted">{tool.description}</p>
            </div>
          )}
          <div className="rounded-ui border border-line bg-sheet p-5">
            <p className="mb-1 text-small text-muted">Formation liée</p>
            <p className="font-semibold">{step.course}</p>
            <p className="mt-1 text-small text-muted">Bientôt disponible.</p>
          </div>
        </aside>
      </div>

      <nav
        aria-label="Étapes précédente et suivante"
        className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6"
      >
        {prev ? (
          <Link href={stepHref(prev.slug)} className="link">
            Étape précédente : {prev.title}
          </Link>
        ) : (
          <Link href={"/se-lancer" as Route} className="link">
            Vue d’ensemble du parcours
          </Link>
        )}
        {next ? (
          <Link href={stepHref(next.slug)} className="link font-semibold">
            Étape suivante : {next.title}
          </Link>
        ) : (
          <Link href={"/se-lancer" as Route} className="link font-semibold">
            Revenir à la vue d’ensemble
          </Link>
        )}
      </nav>
    </Container>
  );
}
