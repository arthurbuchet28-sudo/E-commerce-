import type { MetadataRoute } from "next";

import { routes } from "@/config/routes";
import { guideCategories } from "@/data/categories";
import { parcoursSteps } from "@/data/parcours";
import { getGlossary } from "@/lib/content/glossary";
import { getGuides } from "@/lib/content/guides";
import { absoluteUrl } from "@/lib/seo/json-ld";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    "/",
    ...routes.filter((r) => r.indexable).map((r) => r.path),
    ...parcoursSteps.map((s) => `/se-lancer/${s.slug}`),
    ...guideCategories.map((c) => `/guides/${c.slug}`),
  ].map((path) => ({ url: absoluteUrl(path) }));

  // Drafts are noindex: they never appear in the sitemap.
  const guides = getGuides()
    .filter((g) => !g.draft)
    .map((g) => ({ url: absoluteUrl(g.href), lastModified: g.updatedAt }));
  const terms = getGlossary()
    .filter((t) => !t.draft)
    .map((t) => ({ url: absoluteUrl(t.href), lastModified: t.updatedAt }));

  return [...pages, ...guides, ...terms];
}
