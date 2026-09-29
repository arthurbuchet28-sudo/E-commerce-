/**
 * Price and margin calculator (tool 1).
 *
 * Hypotheses (displayed on the tool page):
 * - Amounts paid by the customer (price, shipping charged) are TTC.
 * - Under the VAT franchise, `vatRate` is 0: no VAT is collected or recovered, so costs are
 *   entered as actually paid. When liable to VAT, costs are entered HT (VAT recoverable).
 * - Marketplace commission and payment fees apply to the total paid by the customer
 *   (price + shipping charged), plus an optional fixed fee per order.
 * - Social contributions (micro-entreprise) apply to turnover excluding VAT.
 */

export type PricingInput = {
  /** Selling price TTC paid by the customer, per unit. */
  price: number;
  purchaseCost: number;
  packagingCost: number;
  /** What the carrier actually charges you. */
  shippingCost: number;
  /** Shipping billed to the customer, TTC. */
  shippingCharged: number;
  /** Ratios: 0.15 = 15 %. */
  commissionRate: number;
  paymentFeeRate: number;
  paymentFeeFixed: number;
  /** 0 under the VAT franchise. */
  vatRate: number;
  socialRate: number;
};

export type PricingResult = {
  revenueTtc: number;
  revenueHt: number;
  vatCollected: number;
  commission: number;
  paymentFees: number;
  variableCosts: number;
  /** Price HT − purchase cost (glossary: marge brute). */
  grossMargin: number;
  /** Gross margin / purchase cost. */
  markupRate: number | null;
  /** Gross margin / price HT (taux de marque). */
  marginRate: number | null;
  /** Revenue HT − all variable costs, before social contributions. */
  contribution: number;
  socialContributions: number;
  /** What is left per order after every cost and contributions. */
  netMargin: number;
  /** Price TTC / purchase cost. */
  multiplier: number | null;
  /** Lowest price TTC for which netMargin ≥ 0, or null if unreachable. */
  minimumPrice: number | null;
};

export function computePricing(i: PricingInput): PricingResult {
  const revenueTtc = i.price + i.shippingCharged;
  const revenueHt = revenueTtc / (1 + i.vatRate);
  const priceHt = i.price / (1 + i.vatRate);
  const commission = i.commissionRate * revenueTtc;
  const paymentFees = i.paymentFeeRate * revenueTtc + i.paymentFeeFixed;
  const variableCosts =
    i.purchaseCost + i.packagingCost + i.shippingCost + commission + paymentFees;
  const grossMargin = priceHt - i.purchaseCost;
  const contribution = revenueHt - variableCosts;
  const socialContributions = i.socialRate * revenueHt;

  return {
    revenueTtc,
    revenueHt,
    vatCollected: revenueTtc - revenueHt,
    commission,
    paymentFees,
    variableCosts,
    grossMargin,
    markupRate: i.purchaseCost > 0 ? grossMargin / i.purchaseCost : null,
    marginRate: priceHt > 0 ? grossMargin / priceHt : null,
    contribution,
    socialContributions,
    netMargin: contribution - socialContributions,
    multiplier: i.purchaseCost > 0 ? i.price / i.purchaseCost : null,
    minimumPrice: minimumPrice(i),
  };
}

/**
 * Solves netMargin(p) = 0 for the price p:
 *   (p + S)·[(1 − s)/(1 + t) − (c + f)] = K + F   ⇒   p = (K + F)/D − S
 * with K the fixed per-unit costs, F the fixed payment fee, D the share of each euro paid
 * by the customer that remains after VAT, contributions, commission and payment fees.
 */
export function minimumPrice(i: PricingInput): number | null {
  const d = (1 - i.socialRate) / (1 + i.vatRate) - (i.commissionRate + i.paymentFeeRate);
  if (d <= 0) return null;
  const k = i.purchaseCost + i.packagingCost + i.shippingCost;
  return Math.max(0, (k + i.paymentFeeFixed) / d - i.shippingCharged);
}
