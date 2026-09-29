import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { guideCategories } from "@/data/categories";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/guides");

export default function GuidesPage() {
  const r = getRoute("/guides");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <h2 className="mb-4 text-h2">Catégories</h2>
      <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {guideCategories.map((c) => (
          <li key={c.slug} className="border-t border-line pt-4">
            <Link href={`/guides/${c.slug}`} className="link font-serif text-h3 font-semibold">
              {c.title}
            </Link>
            <p className="mt-1 text-muted">{c.description}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
