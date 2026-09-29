import "server-only";

import fs from "node:fs";
import path from "node:path";

import { load as loadYaml } from "js-yaml";

import { CONTENT_DIR } from "./files";
import { faqSchema, type Faq } from "./schemas";

export function getFaq(): Faq {
  const raw = loadYaml(fs.readFileSync(path.join(CONTENT_DIR, "faq.yaml"), "utf8"));
  const result = faqSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid content/faq.yaml:\n${result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  }
  return result.data;
}
