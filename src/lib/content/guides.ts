import "server-only";

import path from "node:path";

import type { Route } from "next";

import { findCategory, type GuideCategory } from "@/data/categories";
import { interpolateRefs } from "@/data/reference";

import { CONTENT_DIR, listFiles, readContentFile, showDrafts } from "./files";
import { guideFrontmatterSchema, type GuideFrontmatter } from "./schemas";
import { extractHeadings, readingMinutes, wordCount, type Heading } from "./text";

/** Categories whose guides carry the legal/fiscal disclaimer by default. */
const LEGAL_CATEGORIES = new Set([
  "statut-et-creation",
  "legal-et-conformite",
  "gestion-et-chiffres",
]);

export type Guide = GuideFrontmatter & {
  slug: string;
  categoryInfo: GuideCategory;
  href: Route;
  body: string;
  readingMinutes: number;
  wordCount: number;
  headings: Heading[];
  showLegalNotice: boolean;
};

const GUIDES_DIR = path.join(CONTENT_DIR, "guides");

let cache: Guide[] | undefined;

function loadAll(): Guide[] {
  return listFiles(GUIDES_DIR).map((file) => {
    const { data, body } = readContentFile(file, guideFrontmatterSchema);
    const slug = path.basename(file, ".mdx");
    const folder = path.basename(path.dirname(file));
    if (folder !== data.category) {
      throw new Error(`Guide ${slug}: folder "${folder}" must match category "${data.category}"`);
    }
    const categoryInfo = findCategory(data.category)!;
    return {
      ...data,
      answer: interpolateRefs(data.answer),
      faq: data.faq.map((f) => ({ ...f, answer: interpolateRefs(f.answer) })),
      slug,
      categoryInfo,
      href: `/guides/${data.category}/${slug}` as Route,
      body,
      readingMinutes: readingMinutes(body),
      wordCount: wordCount(body),
      headings: extractHeadings(body),
      showLegalNotice: data.legal ?? LEGAL_CATEGORIES.has(data.category),
    };
  });
}

/** Published guides (plus drafts outside production), most recently updated first. */
export function getGuides(): Guide[] {
  cache ??= loadAll();
  return cache
    .filter((g) => showDrafts() || !g.draft)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title, "fr"));
}

export function getGuide(category: string, slug: string): Guide | undefined {
  return getGuides().find((g) => g.category === category && g.slug === slug);
}

export function getGuidesByCategory(category: string): Guide[] {
  return getGuides().filter((g) => g.category === category);
}

export function getFeaturedGuides(limit = 3): Guide[] {
  const guides = getGuides();
  const featured = guides.filter((g) => g.featured);
  return [...featured, ...guides.filter((g) => !g.featured)].slice(0, limit);
}

/** Other guides of the same category first, then the most recent ones. */
export function getRelatedGuides(guide: Guide, limit = 3): Guide[] {
  const others = getGuides().filter((g) => g.href !== guide.href);
  const same = others.filter((g) => g.category === guide.category);
  return [...same, ...others.filter((g) => g.category !== guide.category)].slice(0, limit);
}
