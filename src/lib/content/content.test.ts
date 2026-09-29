// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mdxComponents } from "@/components/mdx/components";
import { findRoute } from "@/config/routes";

import { getFaq } from "./faq";
import { getGlossary, getTerm } from "./glossary";
import { getGuides } from "./guides";
import { renderMdx } from "./mdx";
import { getVeille } from "./veille";

/** Rendered text must follow French typography (no regular space before : ; ! ?). */
function expectFrenchTypography(html: string, where: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
  const bad = text.match(/.{0,30}[^\s  ] [:;!?](?=\s|$).{0,10}/gm);
  expect(bad, where).toBeNull();
}

describe("guides", () => {
  const guides = getGuides();

  it("loads the seed guides", () => {
    expect(guides.length).toBeGreaterThanOrEqual(5);
  });

  it.each(guides.map((g) => [g.href, g]))("%s renders with valid references", async (_, g) => {
    const html = renderToStaticMarkup(await renderMdx(g.body, mdxComponents(g.sources)));
    expect(html.length).toBeGreaterThan(500);
    expectFrenchTypography(html, g.href);
    expectFrenchTypography(
      `${g.title} ${g.answer} ${g.faq.map((f) => f.question + " " + f.answer).join(" ")}`,
      g.href,
    );
  });

  it.each(guides.map((g) => [g.href, g]))("%s links to existing tools", (_, g) => {
    for (const tool of g.relatedTools) expect(findRoute(tool), tool).toBeDefined();
  });
});

describe("glossary", () => {
  const terms = getGlossary();

  it("has at least 20 terms with unique names", () => {
    expect(terms.length).toBeGreaterThanOrEqual(20);
    expect(new Set(terms.map((t) => t.term)).size).toBe(terms.length);
  });

  it.each(terms.map((t) => [t.slug, t]))(
    "%s renders and references existing terms",
    async (_, t) => {
      for (const r of t.related) expect(getTerm(r), `${t.slug} → ${r}`).toBeDefined();
      const html = renderToStaticMarkup(await renderMdx(t.body, mdxComponents(t.sources)));
      expectFrenchTypography(html + " " + t.definition, t.slug);
    },
  );
});

describe("veille and FAQ", () => {
  it("loads regulatory watch entries with existing related guides", () => {
    const guides = new Set(getGuides().map((g) => `${g.category}/${g.slug}`));
    for (const e of getVeille()) {
      for (const p of e.relatedGuides) expect(guides.has(p), p).toBe(true);
      expectFrenchTypography(`${e.title} ${e.summary} ${e.concerned}`, e.slug);
    }
  });

  it("loads the FAQ", () => {
    const faq = getFaq();
    expect(faq.themes.length).toBeGreaterThan(0);
    for (const t of faq.themes)
      for (const i of t.items) expectFrenchTypography(`${i.question} ${i.answer}`, i.question);
  });
});

describe("course lessons", async () => {
  const fs = await import("node:fs");
  const { listFiles, CONTENT_DIR } = await import("./files");
  const { loadLessonContent } = await import("@/lib/lms/lesson-content");
  const files = listFiles(`${CONTENT_DIR}/formations`).map((f) => f.split("/formations/")[1]);

  it("every lesson referenced by the seed has a text file", () => {
    const seed = fs.readFileSync("supabase/seed.sql", "utf8");
    const paths = [...seed.matchAll(/'([a-z0-9-]+\/[a-z0-9-]+\.mdx)'/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThanOrEqual(10);
    for (const p of paths) expect(files, p).toContain(p);
  });

  it.each(files.map((f) => [f]))("%s renders with valid references", async (file) => {
    const { data, body } = loadLessonContent(file);
    const html = renderToStaticMarkup(await renderMdx(body, mdxComponents(data.sources)));
    expect(html.length).toBeGreaterThan(300);
    expectFrenchTypography(html, file);
  });

  it("refuses paths outside content/formations", () => {
    expect(() => loadLessonContent("../../etc/passwd")).toThrow(/Invalid lesson path/);
  });
});
