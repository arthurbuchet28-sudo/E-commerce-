import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute, routes, type RouteGroup } from "@/config/routes";
import { guideCategories } from "@/data/categories";
import { parcoursSteps } from "@/data/parcours";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/plan-du-site");

const groups: Array<{ group: RouteGroup; title: string }> = [
  { group: "parcours", title: "Parcours" },
  { group: "contenus", title: "Guides et contenus" },
  { group: "outils", title: "Outils" },
  { group: "site", title: "Le site" },
  { group: "legal", title: "Informations légales" },
];

export default function SitemapPage() {
  const r = getRoute("/plan-du-site");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ group, title }) => (
          <section key={group} aria-labelledby={`plan-${group}`}>
            <h2 id={`plan-${group}`} className="mb-3 text-h3">
              {title}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {routes
                .filter((x) => x.group === group && x.indexable)
                .map((x) => (
                  <li key={x.path}>
                    <Link href={x.path} className="link">
                      {x.label}
                    </Link>
                    {x.path === "/se-lancer" && (
                      <ol className="mt-1.5 ml-5 flex list-decimal flex-col gap-1">
                        {parcoursSteps.map((s) => (
                          <li key={s.slug}>
                            <Link href={`/se-lancer/${s.slug}`} className="link">
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ol>
                    )}
                    {x.path === "/guides" && (
                      <ul className="mt-1.5 ml-5 flex list-disc flex-col gap-1">
                        {guideCategories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/guides/${c.slug}`} className="link">
                              {c.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
