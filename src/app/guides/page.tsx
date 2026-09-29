import Link from "next/link";

import { GuidesExplorer } from "@/components/content/GuidesExplorer";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { guideCategories } from "@/data/categories";
import { getGuides, getGuidesByCategory } from "@/lib/content/guides";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/guides");

export default function GuidesPage() {
  const r = getRoute("/guides");
  const guides = getGuides().map((g) => ({
    href: g.href,
    title: g.title,
    description: g.description,
    category: g.category,
    categoryTitle: g.categoryInfo.title,
    level: g.level,
    readingMinutes: g.readingMinutes,
  }));
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <section aria-labelledby="tous-title" className="mb-12 flex flex-col gap-4">
        <h2 id="tous-title" className="text-h2">
          Tous les guides
        </h2>
        <GuidesExplorer
          guides={guides}
          categories={guideCategories.map(({ slug, title }) => ({ slug, title }))}
        />
      </section>
      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="mb-4 text-h2">
          Catégories
        </h2>
        <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {guideCategories.map((c) => {
            const count = getGuidesByCategory(c.slug).length;
            return (
              <li key={c.slug} className="border-t border-line pt-4">
                <Link href={`/guides/${c.slug}`} className="link font-serif text-h3 font-semibold">
                  {c.title}
                </Link>
                <p className="mt-1 text-muted">{c.description}</p>
                <p className="mt-1 text-small text-muted">
                  {count === 0 ? "Guides en préparation" : `${count} guide${count > 1 ? "s" : ""}`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
