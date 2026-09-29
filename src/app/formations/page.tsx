import type { Route } from "next";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { CourseCard } from "@/components/ui/Cards";
import { getRoute } from "@/config/routes";
import { getCatalogue } from "@/lib/lms/queries";
import { formatDuration, formatPrice } from "@/lib/lms/progress";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/formations");
// Catalogue from the database, refreshed every hour (and at each deployment).
export const revalidate = 3600;

export default async function CoursesPage() {
  const r = getRoute("/formations");
  const courses = await getCatalogue();
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      {courses.length === 0 ? (
        <p className="rounded-ui border border-dashed border-border bg-sheet p-5 text-muted">
          Les formations seront bientôt disponibles.
        </p>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <li key={c.id} className="flex">
              <CourseCard
                href={`/formations/${c.slug}` as Route}
                title={c.title}
                summary={c.summary}
                lessons={c.modules.reduce((n, m) => n + m.lessons.length, 0)}
                duration={formatDuration(c.totalMinutes)}
                price={formatPrice(c.priceCents)}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 max-w-prose text-small text-muted">
        À la fin de chaque formation, vous obtenez une attestation de suivi. Ce n’est ni un diplôme
        ni une certification, et nos formations ne sont pas éligibles au CPF.
      </p>
    </Container>
  );
}
