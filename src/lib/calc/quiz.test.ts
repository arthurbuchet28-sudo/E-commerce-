import { describe, expect, it } from "vitest";

import { models, quizQuestions } from "@/data/quiz-modele";

import { isComplete, rankModels, scoreQuiz } from "./quiz";

const answer = (overrides: Record<string, string>) => ({
  budget: "faible",
  temps: "moyen",
  colis: "un-peu",
  fabriquer: "non",
  graphisme: "non",
  chiner: "non",
  expertise: "non",
  controle: "secondaire",
  magasin: "non",
  ...overrides,
});

describe("quiz", () => {
  it("has 8 to 10 questions with unique ids, each option scoring known models", () => {
    expect(quizQuestions.length).toBeGreaterThanOrEqual(8);
    expect(quizQuestions.length).toBeLessThanOrEqual(10);
    expect(new Set(quizQuestions.map((q) => q.id)).size).toBe(quizQuestions.length);
    for (const q of quizQuestions)
      for (const o of q.options)
        for (const m of Object.keys(o.scores)) expect(models).toHaveProperty(m);
  });

  it("detects complete answers", () => {
    expect(isComplete(answer({}))).toBe(true);
    expect(isComplete({ budget: "faible" })).toBe(false);
    expect(isComplete(answer({ budget: "inconnu" }))).toBe(false);
  });

  it("recommends the stock model to a shopkeeper (Karim)", () => {
    expect(
      rankModels(
        answer({ magasin: "oui", colis: "oui", budget: "moyen", controle: "essentiel" }),
      )[0],
    ).toBe("stock");
  });

  it("recommends crafts to someone who makes her own products (Léa)", () => {
    expect(rankModels(answer({ fabriquer: "oui", controle: "essentiel" }))[0]).toBe("artisanat");
  });

  it("recommends print-on-demand to a creative person avoiding parcels (Sophie)", () => {
    expect(
      rankModels(
        answer({ graphisme: "oui", colis: "non", budget: "tres-faible", temps: "peu" }),
      )[0],
    ).toBe("pod");
  });

  it("recommends digital products to someone with an expertise", () => {
    expect(rankModels(answer({ expertise: "oui", colis: "non", budget: "tres-faible" }))[0]).toBe(
      "numerique",
    );
  });

  it("breaks ties by lower financial risk and ignores unknown answers", () => {
    expect(rankModels({})).toEqual([
      "numerique",
      "pod",
      "revente",
      "artisanat",
      "dropshipping",
      "stock",
    ]);
    expect(scoreQuiz({ budget: "nope" }).stock).toBe(0);
  });
});

describe("launch checklist and platforms data", () => {
  it("has 40 to 60 points with unique ids", async () => {
    const { launchChecklist, checklistItemCount } = await import("@/data/checklist");
    expect(checklistItemCount).toBeGreaterThanOrEqual(40);
    expect(checklistItemCount).toBeLessThanOrEqual(60);
    const ids = launchChecklist.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("lists the platforms of the specification with a pricing page and check date", async () => {
    const { platforms, profiles } = await import("@/data/platforms");
    const names = platforms.map((p) => p.name);
    for (const n of [
      "Shopify",
      "WooCommerce",
      "PrestaShop",
      "Wix",
      "Squarespace",
      "Amazon",
      "Cdiscount",
      "Etsy",
      "Vinted Pro",
      "Leboncoin Pro",
      "TikTok Shop",
    ]) {
      expect(names).toContain(n);
    }
    for (const p of platforms) {
      expect(p.pricingUrl).toMatch(/^https:\/\//);
      expect(p.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const prof of p.profiles) expect(profiles).toHaveProperty(prof);
    }
  });
});
