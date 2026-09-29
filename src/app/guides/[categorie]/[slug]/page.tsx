import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GuideList } from "@/components/content/GuideList";
import { GuideMeta, LEGAL_NOTICE } from "@/components/content/GuideMeta";
import { breadcrumbFor, Container } from "@/components/layout/PageHeader";
import { mdxComponents, SourcesList } from "@/components/mdx/components";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { NoBreakHyphens } from "@/components/ui/NoBreakHyphens";
import { findRoute } from "@/config/routes";
import { getGuide, getGuides, getRelatedGuides } from "@/lib/content/guides";
import { renderMdx } from "@/lib/content/mdx";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

/** Table of contents above this length (spec: articles of more than 1,000 words). */
const TOC_MIN_WORDS = 1000;

export function generateStaticParams() {
  return getGuides().map((g) => ({ categorie: g.category, slug: g.slug }));
}

type Props = PageProps<"/guides/[categorie]/[slug]">;

async function load(params: Props["params"]) {
  const { categorie, slug } = await params;
  return getGuide(categorie, slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await load(params);
  if (!guide) return {};
  const meta = buildMetadata({
    title: guide.title,
    description: guide.description,
    path: guide.href,
    indexable: !guide.draft,
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = await load(params);
  if (!guide) notFound();

  const crumbs = breadcrumbFor(guide.href, guide.title, [
    { label: guide.categoryInfo.title, href: `/guides/${guide.category}` as Route },
  ]);
  const content = await renderMdx(guide.body, mdxComponents(guide.sources));
  const showToc = guide.wordCount > TOC_MIN_WORDS && guide.headings.length > 2;
  const tools = guide.relatedTools.map((p) => findRoute(p)).filter((r) => r !== undefined);
  const related = getRelatedGuides(guide);

  return (
    <Container>
      <JsonLd data={articleJsonLd({ ...guide, path: guide.href })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {guide.faq.length > 0 && <JsonLd data={faqJsonLd(guide.faq)} />}

      <article
        data-pagefind-body
        data-pagefind-filter="type:Guide"
        className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,68ch)_1fr]"
      >
        <header className="flex flex-col gap-4 lg:col-span-2">
          <Breadcrumb items={crumbs} />
          <p className="text-small text-muted" data-pagefind-ignore>
            <Link href={`/guides/${guide.category}` as Route} className="link">
              {guide.categoryInfo.title}
            </Link>
          </p>
          <h1 className="max-w-[28ch] text-h1">
            <NoBreakHyphens text={guide.title} />
          </h1>
          <div data-pagefind-ignore>
            <GuideMeta {...guide} />
          </div>
        </header>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="border-l-4 border-sage pl-5">
            <p className="mb-1 font-sans text-small font-semibold text-sage">En bref</p>
            <p className="font-serif text-lead">{guide.answer}</p>
          </div>

          {guide.showLegalNotice && (
            <p
              className="rounded-ui border border-line bg-sheet px-4 py-3 text-small text-muted"
              role="note"
            >
              {LEGAL_NOTICE}
            </p>
          )}

          {showToc && (
            <nav
              aria-labelledby="sommaire-title"
              className="rounded-ui border border-line bg-sheet p-5 lg:hidden"
              data-pagefind-ignore
            >
              <h2 id="sommaire-title" className="mb-2 font-sans text-ui font-semibold text-text">
                Sommaire
              </h2>
              <Toc headings={guide.headings} />
            </nav>
          )}

          <div className="prose-guide">{content}</div>

          {guide.faq.length > 0 && (
            <section aria-labelledby="faq-title" className="flex flex-col gap-4">
              <h2 id="faq-title" className="text-h2">
                Questions fréquentes
              </h2>
              <Accordion
                items={guide.faq.map((f) => ({ title: f.question, content: <p>{f.answer}</p> }))}
              />
            </section>
          )}

          <section
            aria-labelledby="sources-title"
            className="flex flex-col gap-3 border-t border-line pt-6"
          >
            <h2 id="sources-title" className="text-h3">
              Sources
            </h2>
            <SourcesList sources={guide.sources} />
          </section>
        </div>

        <aside className="hidden lg:block" data-pagefind-ignore>
          <div className="sticky top-6 flex flex-col gap-6">
            {showToc && (
              <nav aria-label="Sommaire" className="rounded-ui border border-line bg-sheet p-5">
                <p className="mb-2 font-semibold">Sommaire</p>
                <Toc headings={guide.headings} />
              </nav>
            )}
            {tools.length > 0 && <ToolLinks tools={tools} />}
          </div>
        </aside>
      </article>

      <div className="mt-10 flex flex-col gap-10" data-pagefind-ignore>
        <div className="lg:hidden">{tools.length > 0 && <ToolLinks tools={tools} />}</div>
        <section
          aria-labelledby="suite-title"
          className="rounded-ui border border-line bg-sheet p-6"
        >
          <h2 id="suite-title" className="mb-2 text-h3">
            Passer à l’action
          </h2>
          <p className="mb-4 text-muted">
            Retrouvez ce guide dans le parcours « Se lancer », avec une checklist pour chaque étape.
          </p>
          <ButtonLink href="/se-lancer">Suivre le parcours « Se lancer »</ButtonLink>
        </section>
        {related.length > 0 && (
          <section aria-labelledby="lies-title" className="flex flex-col gap-4">
            <h2 id="lies-title" className="text-h2">
              À lire ensuite
            </h2>
            <GuideList guides={related} />
          </section>
        )}
      </div>
    </Container>
  );
}

function Toc({ headings }: { headings: Array<{ depth: 2 | 3; text: string; id: string }> }) {
  return (
    <ol className="flex flex-col gap-1.5 text-small">
      {headings.map((h) => (
        <li key={h.id} className={h.depth === 3 ? "pl-4" : undefined}>
          <a href={`#${h.id}`} className="link">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function ToolLinks({ tools }: { tools: Array<{ path: Route; label: string }> }) {
  return (
    <nav aria-label="Outils liés" className="rounded-ui border border-line bg-sheet p-5">
      <p className="mb-2 font-semibold">Outils liés</p>
      <ul className="flex flex-col gap-1.5 text-small">
        {tools.map((t) => (
          <li key={t.path}>
            <Link href={t.path} className="link">
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
