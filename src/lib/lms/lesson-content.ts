import "server-only";

import path from "node:path";

import { z } from "zod";

import { CONTENT_DIR, readContentFile } from "@/lib/content/files";
import { sourceSchema } from "@/lib/content/schemas";

export const lessonFrontmatterSchema = z.object({
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Full transcript of the video (accessibility: mandatory when the lesson has a video). */
  transcript: z.string().min(10),
  sources: z.array(sourceSchema).default([]),
});

const SAFE_PATH = /^[a-z0-9-]+\/[a-z0-9-]+\.mdx$/;

/** Reads a lesson text. The path comes from the database: it is validated to stay in content/formations. */
export function loadLessonContent(mdxPath: string) {
  if (!SAFE_PATH.test(mdxPath)) throw new Error(`Invalid lesson path: ${mdxPath}`);
  return readContentFile(path.join(CONTENT_DIR, "formations", mdxPath), lessonFrontmatterSchema);
}
