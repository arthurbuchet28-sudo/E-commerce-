import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { mdxComponents, SourcesList } from "@/components/mdx/components";
import { getGlossary, getTerm } from "@/lib/content/glossary";
import { renderMdx } from "@/lib/content/mdx";
import { breadcrumbJsonLd, definedTermJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getGlossary().map((t) => ({ terme: t.slug }));
}

type Props = PageProps<"/glossaire/[terme]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = getTerm((await params).terme);
  if (!term) return {};
  return buildMetadata({
    title: `${term.term} : définition`,
    description:
      term.definition.length > 155 ? `${term.definition.slice(0, 152)}…` : term.definition,
    path: term.href,
    indexable: !term.draft,
  });
}

export default async function TermPage({ params }: Props) {
  const term = getTerm((await params).terme);
  if (!term) notFound();
  const crumbs = breadcrumbFor(term.href, term.term);
  const related = term.related.map((slug) => getTerm(slug)).filter((t) => t !== undefined);
  const content = await renderMdx(term.body, mdxComponents(term.sources));

  return (
    <Container>
      <JsonLd
        data={definedTermJsonLd({ term: term.term, definition: term.definition, path: term.href })}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div data-pagefind-body data-pagefind-filter="type:Glossaire">
        <PageHeader title={term.term} lead={term.definition} crumbs={crumbs} />
        <div className="prose-guide">{content}</div>
        {term.sources.length > 0 && (
          <section
            aria-labelledby="sources-title"
            className="mt-8 flex max-w-prose flex-col gap-3 border-t border-line pt-6"
          >
            <h2 id="sources-title" className="text-h3">
              Sources
            </h2>
            <SourcesList sources={term.sources} />
          </section>
        )}
      </div>
      {related.length > 0 && (
        <section aria-labelledby="voir-aussi" className="mt-10" data-pagefind-ignore>
          <h2 id="voir-aussi" className="mb-3 text-h3">
            Voir aussi
          </h2>
          <ul className="flex flex-wrap gap-3">
            {related.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="link">
                  {t.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-10">
        <Link href="/glossaire" className="link">
          Retour au glossaire
        </Link>
      </p>
    </Container>
  );
}
