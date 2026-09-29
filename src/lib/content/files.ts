import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import type { z } from "zod";

export const CONTENT_DIR = path.join(process.cwd(), "content");

/** Drafts are visible locally and on previews, never in production. */
export function showDrafts(): boolean {
  return process.env.APP_ENV !== "production";
}

export type ParsedFile<T> = { data: T; body: string; file: string };

/** Reads a Markdown/MDX file and validates its frontmatter; errors name the file. */
export function readContentFile<S extends z.ZodType>(
  file: string,
  schema: S,
): ParsedFile<z.infer<S>> {
  const raw = fs.readFileSync(file, "utf8");
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (e) {
    throw new Error(
      `Invalid YAML frontmatter in ${path.relative(process.cwd(), file)}: ${(e as Error).message}`,
    );
  }
  const { data, content } = parsed;
  const result = schema.safeParse(normalizeDates(data));
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid frontmatter in ${path.relative(process.cwd(), file)}:\n${issues}`);
  }
  return { data: result.data, body: content, file };
}

/** gray-matter parses YAML dates into Date objects: convert them back to YYYY-MM-DD. */
function normalizeDates(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeDates);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeDates(v)]));
  }
  return value;
}

export function listFiles(dir: string, ext = ".mdx"): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(full, ext);
      return entry.name.endsWith(ext) ? [full] : [];
    })
    .sort();
}
