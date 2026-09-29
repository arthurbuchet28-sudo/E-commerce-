import { z } from "zod";

import { guideCategories } from "@/data/categories";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date au format AAAA-MM-JJ attendue");

export const sourceSchema = z.object({
  title: z.string().min(3),
  url: z.url(),
  /** Date de consultation, AAAA-MM-JJ */
  consultedAt: isoDate,
});

export type Source = z.infer<typeof sourceSchema>;

const categorySlugs = guideCategories.map((c) => c.slug) as [string, ...string[]];

export const guideFrontmatterSchema = z
  .object({
    title: z.string().min(10).max(110),
    /** Meta description */
    description: z.string().min(50).max(155),
    /** Direct answer to the title's question, displayed first (GEO). 2-3 sentences. */
    answer: z.string().min(40).max(500),
    category: z.enum(categorySlugs),
    level: z.enum(["debutant", "intermediaire"]),
    publishedAt: isoDate,
    updatedAt: isoDate,
    author: z.string().default("La rédaction"),
    sources: z.array(sourceSchema).min(1, "Au moins une source est obligatoire"),
    relatedTools: z.array(z.string().startsWith("/outils/")).default([]),
    relatedLessons: z.array(z.string()).default([]),
    faq: z.array(z.object({ question: z.string().min(5), answer: z.string().min(10) })).default([]),
    /** Shows the legal/fiscal disclaimer. Defaults to true for legal, status and figures categories. */
    legal: z.boolean().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
  })
  .refine((g) => g.updatedAt >= g.publishedAt, {
    message: "updatedAt doit être postérieure ou égale à publishedAt",
    path: ["updatedAt"],
  });

export type GuideFrontmatter = z.infer<typeof guideFrontmatterSchema>;

export const glossaryFrontmatterSchema = z.object({
  term: z.string().min(2),
  /** Short definition used in tooltips and meta description. */
  definition: z.string().min(20).max(220),
  aliases: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  sources: z.array(sourceSchema).default([]),
  updatedAt: isoDate,
  draft: z.boolean().default(true),
});

export type GlossaryFrontmatter = z.infer<typeof glossaryFrontmatterSchema>;

export const veilleFrontmatterSchema = z.object({
  title: z.string().min(10).max(110),
  /** Date d'entrée en vigueur */
  effectiveDate: isoDate,
  publishedAt: isoDate,
  summary: z.string().min(40).max(300),
  concerned: z.string().min(10),
  sources: z.array(sourceSchema).min(1),
  /** Paths of guides updated accordingly: "categorie/slug" */
  relatedGuides: z.array(z.string()).default([]),
  draft: z.boolean().default(true),
});

export type VeilleFrontmatter = z.infer<typeof veilleFrontmatterSchema>;

export const faqSchema = z.object({
  themes: z
    .array(
      z.object({
        title: z.string(),
        items: z
          .array(z.object({ question: z.string().min(5), answer: z.string().min(10) }))
          .min(1),
      }),
    )
    .min(1),
});

export type Faq = z.infer<typeof faqSchema>;
