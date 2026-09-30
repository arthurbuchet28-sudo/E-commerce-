import type { Route } from "next";

/** URL of a step of the « Se lancer » path (tiny module: safe to import in client components). */
export function stepHref(slug: string): Route {
  return `/se-lancer/${slug}` as Route;
}
