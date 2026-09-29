/** Break-even calculator (tool 3). */

export type BreakEvenInput = {
  fixedCostsMonthly: number;
  /** What each sale leaves after its variable costs (contribution per sale). */
  marginPerSale: number;
  /** Optional average order value, to express the target in turnover. */
  averageOrder: number | null;
};

export type BreakEvenResult = {
  /** Sales per month needed to cover fixed costs, null when the margin is not positive. */
  salesNeeded: number | null;
  revenueNeeded: number | null;
  /** Points for the chart: cumulative margin vs fixed costs, from 0 to about twice the target. */
  series: Array<{ sales: number; margin: number }>;
};

export function computeBreakEven(i: BreakEvenInput): BreakEvenResult {
  if (i.marginPerSale <= 0) return { salesNeeded: null, revenueNeeded: null, series: [] };
  const salesNeeded =
    i.fixedCostsMonthly <= 0 ? 0 : Math.ceil(i.fixedCostsMonthly / i.marginPerSale - 1e-9);
  const maxSales = Math.max(10, salesNeeded * 2);
  const step = Math.max(1, Math.ceil(maxSales / 20));
  const series: BreakEvenResult["series"] = [];
  for (let n = 0; n <= maxSales; n += step) series.push({ sales: n, margin: n * i.marginPerSale });
  return {
    salesNeeded,
    revenueNeeded: i.averageOrder === null ? null : salesNeeded * i.averageOrder,
    series,
  };
}
