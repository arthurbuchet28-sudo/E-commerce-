import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/json-ld";

/** Private areas are never crawled. Outside production, nothing is crawled at all. */
export const privatePaths = [
  "/compte",
  "/admin",
  "/panier",
  "/commande",
  "/apprendre",
  "/api",
  "/design-system",
];

export default function robots(): MetadataRoute.Robots {
  if (process.env.APP_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: privatePaths },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
