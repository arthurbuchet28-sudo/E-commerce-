import { z } from "zod";

/**
 * Consent for trackers (CNIL guidelines). Pure logic, unit-tested.
 * v1 sets no tracker requiring consent: CONSENT_PURPOSES is empty, so the banner never shows.
 * Adding a purpose (e.g. an advertising pixel) makes the banner appear for everyone, with
 * « Tout accepter », « Tout refuser » and « Personnaliser » at the same level.
 */

export type ConsentPurpose = {
  id: string;
  label: string;
  description: string;
  /** Third parties receiving data for this purpose. */
  vendors: string[];
};

/** Purposes requiring consent. Change CONSENT_VERSION whenever this list changes. */
export const CONSENT_PURPOSES: ConsentPurpose[] = [];
export const CONSENT_VERSION = "2026-09-v1";
export const CONSENT_STORAGE_KEY = "pv-consentement";
/** Proofs of choices kept server-side, in months. [À VALIDER] */
export const CONSENT_PROOF_MONTHS = 12;

const recordSchema = z.object({
  visitorId: z.uuid(),
  version: z.string(),
  choices: z.record(z.string(), z.boolean()),
  /** Opposition to the consent-exempt audience measurement (Matomo). */
  audienceOptOut: z.boolean(),
  decidedAt: z.iso.datetime().nullable(),
});

export type ConsentRecord = z.infer<typeof recordSchema>;

export function parseRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = recordSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function emptyRecord(visitorId: string): ConsentRecord {
  return {
    visitorId,
    version: CONSENT_VERSION,
    choices: {},
    audienceOptOut: false,
    decidedAt: null,
  };
}

function addMonths(iso: string, months: number): Date {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** True when the visitor must be asked: purposes exist and no valid, current choice. */
export function needsChoice(
  record: ConsentRecord | null,
  purposes: readonly ConsentPurpose[],
  version: string,
  validityMonths: number,
  now: Date = new Date(),
): boolean {
  if (purposes.length === 0) return false;
  if (!record?.decidedAt || record.version !== version) return true;
  return addMonths(record.decidedAt, validityMonths) <= now;
}

/** A purpose is allowed only by an explicit, current and still valid choice. */
export function isAllowed(
  record: ConsentRecord | null,
  purposeId: string,
  purposes: readonly ConsentPurpose[],
  version: string,
  validityMonths: number,
  now: Date = new Date(),
): boolean {
  if (needsChoice(record, purposes, version, validityMonths, now)) return false;
  return record?.choices[purposeId] === true;
}

/** Records a decision on every purpose (unknown ids dropped, missing ones refused). */
export function decide(
  record: ConsentRecord,
  choices: Record<string, boolean>,
  purposes: readonly ConsentPurpose[],
  version: string,
  now: Date = new Date(),
): ConsentRecord {
  return {
    ...record,
    version,
    choices: Object.fromEntries(purposes.map((p) => [p.id, choices[p.id] === true])),
    decidedAt: now.toISOString(),
  };
}

export const allChoices = (purposes: readonly ConsentPurpose[], value: boolean) =>
  Object.fromEntries(purposes.map((p) => [p.id, value]));
