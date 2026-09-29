import "server-only";

import path from "node:path";

import { z } from "zod";

import { CONTENT_DIR, readContentFile } from "./files";
import { sourceSchema } from "./schemas";

/** Legal pages: content/legal/<slug>.mdx. Templates stay tagged until a lawyer validates them. */
export const legalFrontmatterSchema = z.object({
  version: z.string().min(3),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** « trame »: draft to be validated by a legal professional (warning shown on the page). */
  status: z.enum(["trame", "valide"]),
  sources: z.array(sourceSchema).default([]),
});

export const LEGAL_SLUGS = [
  "mentions-legales",
  "cgv",
  "cgu",
  "confidentialite",
  "cookies",
  "accessibilite",
] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function getLegalPage(slug: LegalSlug) {
  return readContentFile(path.join(CONTENT_DIR, "legal", `${slug}.mdx`), legalFrontmatterSchema);
}
