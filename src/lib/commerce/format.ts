/** Amounts and dates for orders, invoices and e-mails (French format, Paris time). */

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatDateParis(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(
    new Date(iso),
  );
}

/** « 29 septembre 2026 à 14 h 05 » (French typographic convention for times). */
export function formatDateTimeParis(iso: string): string {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${get("day")} ${get("month")} ${get("year")} à ${get("hour")} h ${get("minute")}`;
}

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}

const ORDER_REFERENCE = /^PV-[A-HJ-NP-Z2-9]{8}$/;

/** Normalizes a reference typed by hand (« pv-abcd efgh » → « PV-ABCDEFGH »). */
export function normalizeOrderReference(input: string): string | null {
  const compact = input.toUpperCase().replace(/[\s-]/g, "");
  const ref = compact.startsWith("PV") ? `PV-${compact.slice(2)}` : `PV-${compact}`;
  return ORDER_REFERENCE.test(ref) ? ref : null;
}
