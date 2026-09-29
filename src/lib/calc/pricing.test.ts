import { describe, expect, it } from "vitest";

import { computePricing, minimumPrice, type PricingInput } from "./pricing";

const base: PricingInput = {
  price: 40,
  purchaseCost: 12,
  packagingCost: 1,
  shippingCost: 5,
  shippingCharged: 5,
  commissionRate: 0,
  paymentFeeRate: 0,
  paymentFeeFixed: 0,
  vatRate: 0,
  socialRate: 0,
};

describe("computePricing", () => {
  it("under the VAT franchise with no fees, margins are simple differences", () => {
    const r = computePricing(base);
    expect(r.revenueTtc).toBe(45);
    expect(r.revenueHt).toBe(45);
    expect(r.vatCollected).toBe(0);
    expect(r.grossMargin).toBe(28);
    expect(r.variableCosts).toBe(18);
    expect(r.contribution).toBe(27);
    expect(r.netMargin).toBe(27);
    expect(r.multiplier).toBeCloseTo(40 / 12);
    expect(r.markupRate).toBeCloseTo(28 / 12);
    expect(r.marginRate).toBeCloseTo(28 / 40);
  });

  it("removes VAT from revenue when liable to VAT", () => {
    const r = computePricing({ ...base, vatRate: 0.2, price: 60, shippingCharged: 0 });
    expect(r.revenueHt).toBeCloseTo(50);
    expect(r.vatCollected).toBeCloseTo(10);
    expect(r.grossMargin).toBeCloseTo(38);
  });

  it("applies commission and payment fees on the total paid, plus a fixed fee", () => {
    const r = computePricing({
      ...base,
      commissionRate: 0.1,
      paymentFeeRate: 0.02,
      paymentFeeFixed: 0.25,
    });
    expect(r.commission).toBeCloseTo(4.5);
    expect(r.paymentFees).toBeCloseTo(0.9 + 0.25);
    expect(r.variableCosts).toBeCloseTo(18 + 4.5 + 1.15);
  });

  it("deducts social contributions from turnover excluding VAT", () => {
    const r = computePricing({ ...base, socialRate: 0.1 });
    expect(r.socialContributions).toBeCloseTo(4.5);
    expect(r.netMargin).toBeCloseTo(27 - 4.5);
  });

  it("returns null ratios when the purchase cost is zero", () => {
    const r = computePricing({ ...base, purchaseCost: 0 });
    expect(r.multiplier).toBeNull();
    expect(r.markupRate).toBeNull();
  });

  it("returns a null margin rate when the price is zero", () => {
    expect(computePricing({ ...base, price: 0 }).marginRate).toBeNull();
  });
});

describe("minimumPrice", () => {
  it("is the price for which the net margin is exactly zero", () => {
    const input = {
      ...base,
      commissionRate: 0.12,
      paymentFeeRate: 0.015,
      paymentFeeFixed: 0.25,
      vatRate: 0.2,
      socialRate: 0.1,
    };
    const p = minimumPrice(input)!;
    expect(computePricing({ ...input, price: p }).netMargin).toBeCloseTo(0, 8);
  });

  it("covers costs minus shipping charged, and never goes below zero", () => {
    expect(minimumPrice(base)).toBeCloseTo(13);
    expect(minimumPrice({ ...base, shippingCharged: 100 })).toBe(0);
  });

  it("is unreachable when fees and taxes take every euro", () => {
    expect(minimumPrice({ ...base, commissionRate: 0.6, socialRate: 0.5 })).toBeNull();
  });
});
