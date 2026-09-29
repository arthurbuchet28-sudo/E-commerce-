import type { Metadata } from "next";

import { getRoute, type StaticPath } from "@/config/routes";
import { siteConfig } from "@/config/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  indexable?: boolean;
};

/** Canonical URL, Open Graph and robots for a page. Titles get the site-name suffix. */
export function buildMetadata({
  title,
  description,
  path,
  indexable = true,
}: BuildMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: "fr_FR",
      type: "website",
    },
    robots: indexable ? undefined : { index: false, follow: false },
  };
}

/** Metadata for a static page declared in src/config/routes.ts. */
export function pageMetadata(path: StaticPath): Metadata {
  const r = getRoute(path);
  return buildMetadata({
    title: r.title,
    description: r.description,
    path: r.path,
    indexable: r.indexable,
  });
}
