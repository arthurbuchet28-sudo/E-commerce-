import { describe, expect, it } from "vitest";

import {
  checkPdf,
  courseSchema,
  csvCell,
  formatEurosInput,
  formatFaq,
  lessonSchema,
  lines,
  MAX_RESOURCE_BYTES,
  moduleSchema,
  newCourseSchema,
  parseEuros,
  parseFaq,
  publishProblems,
  questionSchema,
  storageFileName,
  toCsv,
} from "./schemas";

const course = {
  title: "Trouver ses fournisseurs",
  slug: "trouver-ses-fournisseurs",
  code: "F2",
  summary: "Résumé",
  audience: "Tous",
  objectives: "Objectif 1\n\n  Objectif 2  \n",
  prerequisites: "",
  level: "debutant",
  price: "49,90",
  accessMonths: "24",
  position: "2",
  faq: "Combien de temps ?\nDeux heures.\n\nFaut-il un compte ?\nOui,\ngratuit.",
};

describe("helpers", () => {
  it("splits lines and parses prices", () => {
    expect(lines("a\r\n\n b \n")).toEqual(["a", "b"]);
    expect(parseEuros("49")).toBe(4900);
    expect(parseEuros("49,9")).toBe(4990);
    expect(parseEuros("49.90 €")).toBe(4990);
    expect(parseEuros("0")).toBeNull();
    expect(parseEuros("abc")).toBeNull();
    expect(formatEurosInput(4900)).toBe("49");
    expect(formatEurosInput(4990)).toBe("49,90");
    expect(formatEurosInput(null)).toBe("");
  });

  it("round-trips the FAQ text format", () => {
    const faq = parseFaq(course.faq);
    expect(faq).toEqual([
      { question: "Combien de temps ?", answer: "Deux heures." },
      { question: "Faut-il un compte ?", answer: "Oui, gratuit." },
    ]);
    expect(parseFaq(formatFaq(faq))).toEqual(faq);
    expect(parseFaq("")).toEqual([]);
  });
});

describe("course form", () => {
  it("accepts a paid course and converts fields", () => {
    const v = courseSchema.parse(course);
    expect(v.priceCents).toBe(4990);
    expect(v.isFree).toBe(false);
    expect(v.objectives).toEqual(["Objectif 1", "Objectif 2"]);
    expect(v.faq).toHaveLength(2);
  });

  it("ignores the price of a free course", () => {
    expect(courseSchema.parse({ ...course, isFree: "on", price: "" }).priceCents).toBeNull();
  });

  it("reports a missing price, a bad slug and an unanswered question", () => {
    const noPrice = courseSchema.safeParse({ ...course, price: "" });
    expect(noPrice.error?.issues[0].path).toEqual(["price"]);
    const slug = courseSchema.safeParse({ ...course, slug: "Pas Bon" });
    expect(slug.error?.issues[0].path).toEqual(["slug"]);
    const faq = courseSchema.safeParse({ ...course, faq: "Question seule ?" });
    expect(faq.error?.issues[0].path).toEqual(["faq"]);
    expect(newCourseSchema.safeParse({ title: "", slug: "abc", code: "F" }).success).toBe(false);
  });
});

describe("module, lesson and question forms", () => {
  it("validates the pass score", () => {
    expect(moduleSchema.parse({ title: "M", passScore: "80" }).passScore).toBe(80);
    expect(moduleSchema.safeParse({ title: "M", passScore: "120" }).success).toBe(false);
  });

  const lesson = {
    title: "Leçon",
    slug: "ma-lecon",
    durationMin: "15",
    mdxPath: "ma-formation/ma-lecon.mdx",
    videoId: "",
  };

  it("validates lessons and their text path", () => {
    const v = lessonSchema.parse({
      ...lesson,
      hasVideo: "on",
      isPreview: "on",
      videoId: "abc-123",
    });
    expect(v).toMatchObject({
      hasVideo: true,
      isPreview: true,
      videoId: "abc-123",
      durationMin: 15,
    });
    expect(lessonSchema.parse(lesson).videoId).toBeNull();
    expect(lessonSchema.safeParse({ ...lesson, mdxPath: "../secret.mdx" }).success).toBe(false);
    const noVideo = lessonSchema.safeParse({ ...lesson, videoId: "abc" });
    expect(noVideo.error?.issues[0].path).toEqual(["hasVideo"]);
  });

  it("validates quiz questions", () => {
    const q = questionSchema.parse({
      prompt: "Question ?",
      choices: "A\nB\nC",
      correct: "2",
      explanation: "Parce que.",
    });
    expect(q).toEqual({
      prompt: "Question ?",
      choices: ["A", "B", "C"],
      correctIndex: 1,
      explanation: "Parce que.",
    });
    const one = questionSchema.safeParse({
      prompt: "Q",
      choices: "A",
      correct: "1",
      explanation: "E",
    });
    expect(one.error?.issues[0].path).toEqual(["choices"]);
    const out = questionSchema.safeParse({
      prompt: "Q",
      choices: "A\nB",
      correct: "3",
      explanation: "E",
    });
    expect(out.error?.issues[0].path).toEqual(["correct"]);
  });
});

describe("resources", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7");
  it("accepts only real PDFs under the size limit", () => {
    expect(checkPdf("plan.pdf", 1000, pdf)).toBeNull();
    expect(checkPdf("plan.pdf", 0, pdf)).toMatch(/Choisissez/);
    expect(checkPdf("plan.pdf", MAX_RESOURCE_BYTES + 1, pdf)).toMatch(/4 Mo/);
    expect(checkPdf("plan.exe", 1000, pdf)).toMatch(/PDF/);
    expect(checkPdf("faux.pdf", 1000, new TextEncoder().encode("MZ..."))).toMatch(/pas un PDF/);
  });

  it("builds safe storage names", () => {
    expect(storageFileName("Plan d’action 30 jours (v2).PDF")).toBe(
      "plan-d-action-30-jours-v2.pdf",
    );
    expect(storageFileName("???.pdf")).toBe("ressource.pdf");
  });
});

describe("publication checks", () => {
  const ok = {
    isFree: false,
    priceCents: 4900,
    modules: [{ title: "M1", lessons: [{ title: "L1", mdxPath: "f/l1.mdx" }] }],
  };
  it("lists every blocking problem", () => {
    expect(publishProblems(ok, () => true)).toEqual([]);
    expect(
      publishProblems(
        {
          isFree: false,
          priceCents: null,
          modules: [
            { title: "M1", lessons: [{ title: "L1", mdxPath: "f/l1.mdx" }] },
            { title: "M2", lessons: [] },
          ],
        },
        () => false,
      ).map((p) => p.replaceAll("\u00a0", " ")),
    ).toEqual([
      "La formation payante n’a pas de prix.",
      "Le texte de la leçon « L1 » est introuvable (f/l1.mdx).",
      "Le module « M2 » n’a aucune leçon.",
    ]);
    expect(publishProblems({ ...ok, modules: [] }, () => true)).toEqual([
      "La formation n’a aucun module.",
    ]);
  });
});

describe("CSV export", () => {
  it("quotes cells and neutralizes formulas", () => {
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell("=HYPERLINK(1)")).toBe(`"'=HYPERLINK(1)"`);
    expect(csvCell(null)).toBe('""');
    expect(toCsv(["a", "b"], [[1, "x"]])).toBe('﻿"a";"b"\r\n"1";"x"\r\n');
  });
});
