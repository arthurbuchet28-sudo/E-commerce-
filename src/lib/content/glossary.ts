import "server-only";

import path from "node:path";

import type { Route } from "next";

import { CONTENT_DIR, listFiles, readContentFile, showDrafts } from "./files";
import { glossaryFrontmatterSchema, type GlossaryFrontmatter } from "./schemas";

export type GlossaryTerm = GlossaryFrontmatter & { slug: string; href: Route; body: string };

let cache: GlossaryTerm[] | undefined;

function loadAll(): GlossaryTerm[] {
  return listFiles(path.join(CONTENT_DIR, "glossaire")).map((file) => {
    const { data, body } = readContentFile(file, glossaryFrontmatterSchema);
    const slug = path.basename(file, ".mdx");
    return { ...data, slug, href: `/glossaire/${slug}` as Route, body };
  });
}

export function getGlossary(): GlossaryTerm[] {
  cache ??= loadAll();
  return cache
    .filter((t) => showDrafts() || !t.draft)
    .sort((a, b) => a.term.localeCompare(b.term, "fr", { sensitivity: "base" }));
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return getGlossary().find((t) => t.slug === slug);
}

/** First letter used for A–Z grouping (accents folded: « É » → « E »). */
export function initialOf(term: string): string {
  const letter = term.normalize("NFD").replace(/\p{M}/gu, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

export function groupByInitial(terms: GlossaryTerm[]): Array<[string, GlossaryTerm[]]> {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const t of terms) {
    const key = initialOf(t.term);
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}
