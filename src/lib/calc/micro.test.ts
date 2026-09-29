import { describe, expect, it } from "vitest";

import { prorataFactor, simulateMicro, type MicroInput, type MicroThresholds } from "./micro";

const t: MicroThresholds = {
  ceiling: 100_000,
  vatThreshold: 50_000,
  vatThresholdIncreased: 60_000,
};
const base: MicroInput = {
  annualRevenue: 20_000,
  startDate: null,
  year: 2026,
  contributionRate: 0.1,
  liberatoire: false,
  liberatoireRate: 0.01,
};
const ids = (i: Partial<MicroInput>) => simulateMicro({ ...base, ...i }, t).alerts.map((a) => a.id);

describe("prorataFactor", () => {
  it("is 1 without start date or when started a previous year", () => {
    expect(prorataFactor(null, 2026)).toBe(1);
    expect(prorataFactor("2025-06-01", 2026)).toBe(1);
    expect(prorataFactor("not a date", 2026)).toBe(1);
  });
  it("counts the remaining days of the year of creation", () => {
    expect(prorataFactor("2026-01-01", 2026)).toBe(1);
    expect(prorataFactor("2026-07-02", 2026)).toBeCloseTo(183 / 365);
    expect(prorataFactor("2028-07-01", 2028)).toBeCloseTo(184 / 366);
  });
  it("is 0 when the activity starts after the simulated year", () => {
    expect(prorataFactor("2027-02-01", 2026)).toBe(0);
  });
});

describe("simulateMicro", () => {
  it("computes contributions, flat-rate tax and what remains", () => {
    const r = simulateMicro({ ...base, liberatoire: true }, t);
    expect(r.contributions).toBe(2_000);
    expect(r.incomeTax).toBe(200);
    expect(r.remaining).toBe(17_800);
    expect(r.ceilingUsage).toBeCloseTo(0.2);
    expect(r.alerts).toEqual([]);
  });

  it("leaves unknown amounts empty instead of guessing", () => {
    const r = simulateMicro({ ...base, contributionRate: null }, t);
    expect(r.contributions).toBeNull();
    expect(r.remaining).toBeNull();
    const r2 = simulateMicro({ ...base, liberatoire: true, liberatoireRate: null }, t);
    expect(r2.incomeTax).toBeNull();
    expect(simulateMicro(base, t).incomeTax).toBe(0);
  });

  it("prorates the ceiling the year of creation", () => {
    const r = simulateMicro({ ...base, startDate: "2026-07-02", annualRevenue: 60_000 }, t);
    expect(r.ceiling).toBeCloseTo((100_000 * 183) / 365);
    expect(r.alerts.map((a) => a.id)).toContain("ceiling-exceeded");
  });

  it("raises ceiling alerts at 80 % and beyond 100 %", () => {
    expect(ids({ annualRevenue: 79_999 })).not.toContain("ceiling-approaching");
    expect(ids({ annualRevenue: 80_000 })).toContain("ceiling-approaching");
    expect(ids({ annualRevenue: 100_001 })).toContain("ceiling-exceeded");
  });

  it("raises VAT alerts for approaching, threshold and increased threshold", () => {
    expect(ids({ annualRevenue: 40_000 })).toEqual(["vat-approaching"]);
    expect(ids({ annualRevenue: 55_000 })).toEqual(["vat-exceeded"]);
    expect(ids({ annualRevenue: 60_001 })).toEqual(["vat-increased-exceeded"]);
  });

  it("flags an activity starting after the simulated year", () => {
    expect(ids({ startDate: "2027-03-01" })).toContain("start-later");
    expect(simulateMicro({ ...base, startDate: "2027-03-01" }, t).ceilingUsage).toBe(0);
  });
});
