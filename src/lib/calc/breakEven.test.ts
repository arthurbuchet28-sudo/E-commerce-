import { describe, expect, it } from "vitest";

import { computeBreakEven } from "./breakEven";

describe("computeBreakEven", () => {
  it("rounds the number of sales up", () => {
    expect(
      computeBreakEven({ fixedCostsMonthly: 300, marginPerSale: 12, averageOrder: null })
        .salesNeeded,
    ).toBe(25);
    expect(
      computeBreakEven({ fixedCostsMonthly: 301, marginPerSale: 12, averageOrder: null })
        .salesNeeded,
    ).toBe(26);
  });

  it("does not add a sale because of floating-point noise", () => {
    expect(
      computeBreakEven({ fixedCostsMonthly: 0.3, marginPerSale: 0.1, averageOrder: null })
        .salesNeeded,
    ).toBe(3);
  });

  it("expresses the target in turnover when the average order is known", () => {
    expect(
      computeBreakEven({ fixedCostsMonthly: 300, marginPerSale: 12, averageOrder: 40 })
        .revenueNeeded,
    ).toBe(1000);
  });

  it("needs no sale without fixed costs", () => {
    expect(
      computeBreakEven({ fixedCostsMonthly: 0, marginPerSale: 5, averageOrder: 20 }).salesNeeded,
    ).toBe(0);
  });

  it("is unreachable when each sale loses money", () => {
    const r = computeBreakEven({ fixedCostsMonthly: 100, marginPerSale: 0, averageOrder: 10 });
    expect(r).toEqual({ salesNeeded: null, revenueNeeded: null, series: [] });
  });

  it("builds a chart series up to about twice the target", () => {
    const r = computeBreakEven({ fixedCostsMonthly: 300, marginPerSale: 12, averageOrder: null });
    expect(r.series[0]).toEqual({ sales: 0, margin: 0 });
    expect(r.series.at(-1)!.sales).toBeGreaterThanOrEqual(48);
    expect(r.series.length).toBeLessThanOrEqual(22);
  });
});
