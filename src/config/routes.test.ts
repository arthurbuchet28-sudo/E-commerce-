import { describe, expect, it } from "vitest";

import { guideCategories } from "@/data/categories";
import { parcoursSteps } from "@/data/parcours";

import { footerNav, mainNav, routes } from "./routes";
import { siteConfig } from "./site";

const SUFFIX = ` · ${siteConfig.name}`;

/** French typography: no regular space before « : ; ! ? » » nor after « « ». */
function typographyErrors(text: string): string[] {
  const errors: string[] = [];
  if (/ [:;!?»]/.test(text)) errors.push("regular space before high punctuation");
  if (/« /.test(text)) errors.push("regular space after «");
  if (/\S[:;!?](?=\s|$)/u.test(text.replace(/https?:\/\/\S+/g, ""))) {
    errors.push("missing non-breaking space before high punctuation");
  }
  return errors;
}

describe("route registry", () => {
  it("has unique paths", () => {
    const paths = routes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it.each(routes.map((r) => [r.path, r]))("%s: title ≤ 60 and description ≤ 155", (_, r) => {
    expect((r.title + SUFFIX).length).toBeLessThanOrEqual(60);
    expect(r.description.length).toBeLessThanOrEqual(155);
    expect(r.description.length).toBeGreaterThan(30);
  });

  it.each(routes.map((r) => [r.path, r]))("%s: French typography", (_, r) => {
    for (const text of [r.label, r.h1, r.title, r.description]) {
      expect(typographyErrors(text), text).toEqual([]);
    }
  });

  it("never indexes account, order and admin pages", () => {
    for (const r of routes) {
      if (["compte", "commande", "interne"].includes(r.group))
        expect(r.indexable, r.path).toBe(false);
    }
  });

  it("navigation only points to registered pages", () => {
    const paths = new Set<string>(routes.map((r) => r.path));
    for (const p of [...mainNav, ...footerNav.flatMap((c) => c.paths)])
      expect(paths.has(p)).toBe(true);
  });
});

describe("content data typography", () => {
  it("parcours steps and categories use French typography", () => {
    const texts = [
      ...parcoursSteps.map((s) => s.title),
      ...guideCategories.flatMap((c) => [c.title, c.description]),
    ];
    for (const text of texts) expect(typographyErrors(text), text).toEqual([]);
  });

  it("has 8 parcours steps with unique slugs", () => {
    expect(parcoursSteps).toHaveLength(8);
    expect(new Set(parcoursSteps.map((s) => s.slug)).size).toBe(8);
  });
});
