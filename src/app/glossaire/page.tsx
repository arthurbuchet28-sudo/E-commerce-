import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { getGlossary, groupByInitial } from "@/lib/content/glossary";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/glossaire");

export default function GlossaryPage() {
  const r = getRoute("/glossaire");
  const groups = groupByInitial(getGlossary());
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <nav aria-label="Lettres du glossaire" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {groups.map(([letter]) => (
            <li key={letter}>
              <a
                href={`#lettre-${letter}`}
                className="flex size-11 items-center justify-center rounded-ui border border-line bg-sheet font-semibold text-ink hover:border-ink"
              >
                {letter}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-10">
        {groups.map(([letter, terms]) => (
          <section
            key={letter}
            id={`lettre-${letter}`}
            aria-labelledby={`titre-${letter}`}
            className="scroll-mt-6"
          >
            <h2 id={`titre-${letter}`} className="mb-4 border-b border-line pb-2 text-h2">
              {letter}
            </h2>
            <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {terms.map((t) => (
                <div key={t.slug}>
                  <dt>
                    <Link href={t.href} className="link font-semibold">
                      {t.term}
                    </Link>
                  </dt>
                  <dd className="mt-1 text-muted">{t.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Container>
  );
}
