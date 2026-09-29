import type { Route } from "next";
import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { formatDate, SourcesList } from "@/components/mdx/components";
import { getRoute } from "@/config/routes";
import { getGuides } from "@/lib/content/guides";
import { getVeille } from "@/lib/content/veille";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...pageMetadata("/veille-reglementaire"),
  alternates: {
    canonical: "/veille-reglementaire",
    types: { "application/rss+xml": "/veille-reglementaire/rss.xml" },
  },
};

export default function VeillePage() {
  const r = getRoute("/veille-reglementaire");
  const guides = getGuides();
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <p className="mb-8">
        <a href="/veille-reglementaire/rss.xml" className="link">
          S’abonner au flux RSS de la veille
        </a>
      </p>
      <ol className="flex max-w-3xl flex-col gap-8">
        {getVeille().map((e) => {
          const related = e.relatedGuides
            .map((p) => guides.find((g) => `${g.category}/${g.slug}` === p))
            .filter((g) => g !== undefined);
          return (
            <li
              key={e.slug}
              id={e.slug}
              className="scroll-mt-6 rounded-ui border border-line bg-sheet p-6"
            >
              <article className="flex flex-col gap-3">
                <p className="text-small font-semibold text-sage">
                  En vigueur depuis le{" "}
                  <time dateTime={e.effectiveDate}>{formatDate(e.effectiveDate)}</time>
                </p>
                <h2 className="text-h3">{e.title}</h2>
                <p>{e.summary}</p>
                <p>
                  <span className="font-semibold">Qui est concerné{" "}: </span>
                  {e.concerned}
                </p>
                {related.length > 0 && (
                  <p>
                    <span className="font-semibold">Guides mis à jour{" "}: </span>
                    {related.map((g, i) => (
                      <span key={g.href}>
                        {i > 0 && ", "}
                        <Link href={g.href as Route} className="link">
                          {g.title}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
                <details>
                  <summary className="cursor-pointer text-small font-semibold">Sources</summary>
                  <div className="mt-2">
                    <SourcesList sources={e.sources} />
                  </div>
                </details>
              </article>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
