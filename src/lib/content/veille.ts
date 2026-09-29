import "server-only";

import path from "node:path";

import { interpolateRefs } from "@/data/reference";

import { CONTENT_DIR, listFiles, readContentFile, showDrafts } from "./files";
import { veilleFrontmatterSchema, type VeilleFrontmatter } from "./schemas";

export type VeilleEntry = VeilleFrontmatter & { slug: string; body: string };

let cache: VeilleEntry[] | undefined;

/** Regulatory changes, most recent effective date first. */
export function getVeille(): VeilleEntry[] {
  cache ??= listFiles(path.join(CONTENT_DIR, "veille")).map((file) => {
    const { data, body } = readContentFile(file, veilleFrontmatterSchema);
    return {
      ...data,
      summary: interpolateRefs(data.summary),
      concerned: interpolateRefs(data.concerned),
      slug: path.basename(file, ".mdx"),
      body,
    };
  });
  return cache
    .filter((e) => showDrafts() || !e.draft)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
}
