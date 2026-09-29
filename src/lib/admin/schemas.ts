import { z } from "zod";

/**
 * Validation of back-office forms (pure, unit-tested). Every field comes from FormData:
 * strings only, checkboxes are "on" or absent.
 */

const SLUG = /^[a-z0-9-]{3,80}$/;
/** Lesson text location, relative to content/formations/ (same rule as the lesson loader). */
export const MDX_PATH = /^[a-z0-9-]+\/[a-z0-9-]+\.mdx$/;

const text = (max: number, message = "Champ obligatoire.") =>
  z.string().trim().min(1, message).max(max, `${max} caractères maximum.`);
const checkbox = z
  .literal("on")
  .optional()
  .transform((v) => v === "on");
const intIn = (min: number, max: number, message: string) =>
  z.coerce.number({ error: message }).int(message).min(min, message).max(max, message);

/** One item per line, empty lines ignored. */
export function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** « 49 », « 49,90 », « 49.9 » → cents; null when not a positive amount. */
export function parseEuros(value: string): number | null {
  const m = /^(\d{1,5})(?:[.,](\d{1,2}))?$/.exec(value.trim().replace(/\s|€/g, ""));
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
  return cents > 0 ? cents : null;
}

export function formatEurosInput(cents: number | null): string {
  if (cents === null) return "";
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2).replace(".", ",");
}

/**
 * FAQ as plain text: blocks separated by a blank line; first line = question, rest = answer.
 */
export function parseFaq(value: string): Array<{ question: string; answer: string }> {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((block) =>
      block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean),
    )
    .filter((b) => b.length > 0)
    .map(([question, ...rest]) => ({ question, answer: rest.join(" ") }));
}

export function formatFaq(faq: Array<{ question: string; answer: string }>): string {
  return faq.map((f) => `${f.question}\n${f.answer}`).join("\n\n");
}

export const courseSchema = z
  .object({
    title: text(120),
    slug: z.string().trim().regex(SLUG, "Minuscules, chiffres et tirets (3 à 80 caractères)."),
    code: text(10),
    summary: text(600),
    audience: text(600),
    objectives: z.string().transform(lines),
    prerequisites: z.string().transform(lines),
    level: z.enum(["debutant", "intermediaire"], { error: "Choisissez un niveau." }),
    isFree: checkbox,
    price: z.string().default(""),
    accessMonths: intIn(1, 120, "Entre 1 et 120 mois."),
    position: intIn(0, 999, "Nombre entier entre 0 et 999."),
    faq: z.string().default("").transform(parseFaq),
  })
  .transform((v, ctx) => {
    const priceCents = v.isFree ? null : parseEuros(v.price);
    if (!v.isFree && priceCents === null) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Indiquez un prix TTC, par exemple 49 ou 49,90.",
      });
      return z.NEVER;
    }
    if (v.faq.some((f) => !f.answer)) {
      ctx.addIssue({
        code: "custom",
        path: ["faq"],
        message: "Chaque question doit être suivie de sa réponse.",
      });
      return z.NEVER;
    }
    return { ...v, priceCents };
  });

export const newCourseSchema = z.object({
  title: text(120),
  slug: z.string().trim().regex(SLUG, "Minuscules, chiffres et tirets (3 à 80 caractères)."),
  code: text(10),
});

export const moduleSchema = z.object({
  title: text(160),
  passScore: intIn(0, 100, "Score entre 0 et 100."),
});

export const lessonSchema = z
  .object({
    title: text(160),
    slug: z.string().trim().regex(SLUG, "Minuscules, chiffres et tirets (3 à 80 caractères)."),
    durationMin: intIn(1, 600, "Durée en minutes, entre 1 et 600."),
    mdxPath: z.string().trim().regex(MDX_PATH, "Format attendu : formation/lecon.mdx"),
    hasVideo: checkbox,
    videoId: z
      .string()
      .trim()
      .max(100)
      .regex(/^[A-Za-z0-9-]*$/, "Identifiant vidéo : lettres, chiffres et tirets.")
      .transform((v) => v || null),
    isPreview: checkbox,
  })
  .transform((v, ctx) => {
    if (v.videoId && !v.hasVideo) {
      ctx.addIssue({
        code: "custom",
        path: ["hasVideo"],
        message: "Cochez « Leçon en vidéo » pour associer une vidéo.",
      });
      return z.NEVER;
    }
    return v;
  });

export const questionSchema = z
  .object({
    prompt: text(500),
    choices: z.string().transform(lines),
    correct: intIn(1, 6, "Indiquez le numéro de la bonne réponse."),
    explanation: text(1000),
  })
  .transform((v, ctx) => {
    if (v.choices.length < 2 || v.choices.length > 6) {
      ctx.addIssue({
        code: "custom",
        path: ["choices"],
        message: "Entre 2 et 6 réponses, une par ligne.",
      });
      return z.NEVER;
    }
    if (v.correct > v.choices.length) {
      ctx.addIssue({
        code: "custom",
        path: ["correct"],
        message: "Ce numéro ne correspond à aucune réponse.",
      });
      return z.NEVER;
    }
    return {
      prompt: v.prompt,
      choices: v.choices,
      correctIndex: v.correct - 1,
      explanation: v.explanation,
    };
  });

export const MAX_RESOURCE_BYTES = 4 * 1024 * 1024;

/** A resource must be a real PDF (magic bytes), within the size limit. */
export function checkPdf(name: string, size: number, head: Uint8Array): string | null {
  if (size === 0) return "Choisissez un fichier PDF.";
  if (size > MAX_RESOURCE_BYTES) return "Le fichier dépasse 4 Mo.";
  if (!/\.pdf$/i.test(name)) return "Seuls les fichiers PDF sont acceptés.";
  const magic = String.fromCharCode(...head.subarray(0, 5));
  if (magic !== "%PDF-") return "Ce fichier n’est pas un PDF valide.";
  return null;
}

export function storageFileName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.pdf$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "ressource"}.pdf`;
}

export type PublishCheck = {
  isFree: boolean;
  priceCents: number | null;
  modules: Array<{ title: string; lessons: Array<{ title: string; mdxPath: string }> }>;
};

/** Reasons preventing publication (empty = publishable). `exists` checks a lesson file. */
export function publishProblems(c: PublishCheck, exists: (mdxPath: string) => boolean): string[] {
  const problems: string[] = [];
  if (!c.isFree && !c.priceCents) problems.push("La formation payante n’a pas de prix.");
  if (c.modules.length === 0) problems.push("La formation n’a aucun module.");
  for (const m of c.modules) {
    if (m.lessons.length === 0) problems.push(`Le module « ${m.title} » n’a aucune leçon.`);
    for (const l of m.lessons)
      if (!exists(l.mdxPath))
        problems.push(`Le texte de la leçon « ${l.title} » est introuvable (${l.mdxPath}).`);
  }
  return problems;
}

/** Neutralizes spreadsheet formulas (CSV injection) and quotes every cell. */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  // BOM so that spreadsheet software opens accents correctly; « ; » for French locales.
  return `﻿${[header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n")}\r\n`;
}
