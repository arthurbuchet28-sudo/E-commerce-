import { describe, expect, it } from "vitest";

import { formatRef, getRef, isRefKey, monthsSince, reference, type RefValue } from "./reference";

const entries = Object.entries(reference) as Array<[string, RefValue]>;

describe("reference data", () => {
  it.each(entries)("%s was checked less than 12 months ago", (_, ref) => {
    expect(monthsSince(ref.checkedAt), `checkedAt ${ref.checkedAt}: update the value`).toBeLessThan(
      12,
    );
  });

  it.each(entries)("%s has a source and a valid date", (_, ref) => {
    expect(ref.source.name.length).toBeGreaterThan(2);
    expect(ref.source.url).toMatch(/^https:\/\//);
    expect(ref.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (ref.validUntil) expect(ref.validUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it.each(entries)("%s: unknown values are flagged for verification", (_, ref) => {
    if (ref.value === null) expect(ref.status).toBe("a-verifier");
  });
});

describe("formatRef", () => {
  it("formats euros with a narrow no-break space", () => {
    expect(formatRef(getRef("micro.plafondVente"))).toBe("203 100 € HT");
    expect(formatRef(getRef("fevad.panierMoyen2025"))).toBe("62 €");
  });

  it("formats billions, percentages and signed changes", () => {
    expect(formatRef(getRef("fevad.caTotal2025"))).toBe("196,4 Md€");
    expect(formatRef(getRef("fevad.croissance2025"))).toBe("+7 %");
    expect(formatRef(getRef("fevad.panierMoyenEvolution2025"))).toBe("-3 %");
    expect(formatRef(getRef("fevad.partMarketplaces2025"))).toBe("32 %");
  });

  it("formats dates, qualifiers and missing values", () => {
    expect(formatRef(getRef("conso.fonctionRetractationDate"))).toBe("19 juin 2026");
    expect(formatRef(getRef("fevad.sitesMarchands"))).toBe("plus de 158 000");
    expect(formatRef(getRef("micro.tauxCotisationsVente"))).toBe("[À VÉRIFIER]");
  });

  it("validates keys", () => {
    expect(isRefKey("fevad.caTotal2025")).toBe(true);
    expect(isRefKey("nope")).toBe(false);
  });
});

describe("monthsSince", () => {
  it("counts calendar months", () => {
    expect(monthsSince("2026-09-01", new Date("2027-08-31"))).toBe(11);
    expect(monthsSince("2026-09-01", new Date("2027-09-01"))).toBe(12);
  });
});

describe("interpolateRefs", () => {
  it("replaces placeholders and rejects unknown keys", async () => {
    const { interpolateRefs } = await import("./reference");
    expect(interpolateRefs("Seuil : {{tva.franchiseVentes}}.")).toBe("Seuil : 85 000 €.");
    expect(() => interpolateRefs("{{nope.key}}")).toThrow(/nope.key/);
  });
});
