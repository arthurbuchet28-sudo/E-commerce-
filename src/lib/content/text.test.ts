import { describe, expect, it } from "vitest";

import { extractHeadings, readingMinutes, wordCount } from "./text";

describe("content text helpers", () => {
  it("counts words, ignoring code and JSX", () => {
    const mdx = 'Un deux trois.\n\n<Encadre type="info">quatre</Encadre>\n\n```\nnot counted\n```';
    expect(wordCount(mdx)).toBe(4);
  });

  it("computes reading time with a 1-minute minimum", () => {
    expect(readingMinutes("mot ".repeat(10))).toBe(1);
    expect(readingMinutes("mot ".repeat(1100))).toBe(5);
  });

  it("extracts h2/h3 headings with github-slugger ids", () => {
    const mdx =
      "## Qu’est-ce que la TVA ?\n\ntext\n\n### Taux réduit\n\n## Qu’est-ce que la TVA ?\n```\n## no\n```";
    expect(extractHeadings(mdx)).toEqual([
      { depth: 2, text: "Qu’est-ce que la TVA ?", id: "quest-ce-que-la-tva-" },
      { depth: 3, text: "Taux réduit", id: "taux-réduit" },
      { depth: 2, text: "Qu’est-ce que la TVA ?", id: "quest-ce-que-la-tva--1" },
    ]);
  });
});
