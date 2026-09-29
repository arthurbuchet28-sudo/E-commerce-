import type { MetadataRoute } from "next";

import { routes } from "@/config/routes";
import { guideCategories } from "@/data/categories";
import { parcoursSteps } from "@/data/parcours";
import { absoluteUrl } from "@/lib/seo/json-ld";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...routes.filter((r) => r.indexable).map((r) => r.path),
    ...parcoursSteps.map((s) => `/se-lancer/${s.slug}`),
    ...guideCategories.map((c) => `/guides/${c.slug}`),
  ];
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
