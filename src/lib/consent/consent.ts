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

export type ConsentRecord = {
  visitorId: string;
  version: string;
  choices: Record<string, boolean>;
  /** Opposition to the consent-exempt audience measurement (Matomo). */
  audienceOptOut: boolean;
  decidedAt: string | null;
};

// Hand-written validation: this module runs on every page, and Zod would add ~90 KB of
// JavaScript to the shared bundle (phase 14 budget).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(v) || !isRecord(v.choices)) return null;
  const { visitorId, version, choices, audienceOptOut, decidedAt } = v;
  if (typeof visitorId !== "string" || !UUID.test(visitorId)) return null;
  if (typeof version !== "string" || typeof audienceOptOut !== "boolean") return null;
  if (!Object.values(choices).every((c) => typeof c === "boolean")) return null;
  if (decidedAt !== null && (typeof decidedAt !== "string" || !ISO_DATETIME.test(decidedAt))) {
    return null;
  }
  return {
    visitorId,
    version,
    choices: choices as Record<string, boolean>,
    audienceOptOut,
    decidedAt,
  };
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
