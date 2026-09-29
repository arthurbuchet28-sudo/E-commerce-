/** Parses a French-formatted number typed by a user: "1 234,56", "1234.5", "12 %". */
export function parseFrNumber(input: string): number | null {
  const cleaned = input
    .replace(/[\s  ]/g, "")
    .replace(/[€%]/g, "")
    .replace(",", ".");
  if (cleaned === "" || !/^-?\d*\.?\d+$|^-?\d+\.$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const euroRounded = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEuro(n: number, rounded = false): string {
  return (rounded ? euroRounded : euro).format(n);
}

export function formatPercent(ratio: number, digits = 1): string {
  return new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: digits }).format(
    ratio,
  );
}

export function formatNumber(n: number, digits = 2): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(n);
}

/** Rounds money to the cent, avoiding floating-point artefacts. */
export function roundCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
