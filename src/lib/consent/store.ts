"use client";

import { useSyncExternalStore } from "react";

import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  emptyRecord,
  parseRecord,
  type ConsentRecord,
} from "./consent";

/** Browser storage of the visitor's choices (strictly necessary: no consent needed). */

const EVENT = "pv-consent-change";
let cache: { raw: string | null; record: ConsentRecord | null } = { raw: null, record: null };

function readRaw(): string | null {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function snapshot(): ConsentRecord | null {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, record: parseRecord(raw) };
  return cache.record;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/** Current record; `undefined` during server rendering and hydration (nothing shown). */
export function useConsentRecord(): ConsentRecord | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}

export function currentOrNewRecord(): ConsentRecord {
  return snapshot() ?? emptyRecord(crypto.randomUUID());
}

/**
 * Saves the choices locally; with `proof`, also sends the decision to the server
 * (identifier, choices, version and date only).
 */
export function saveConsent(record: ConsentRecord, proof: boolean) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
  window.dispatchEvent(new Event(EVENT));
  if (proof) {
    void fetch("/api/consentement", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        visitorId: record.visitorId,
        version: CONSENT_VERSION,
        choices: record.choices,
      }),
      keepalive: true,
    }).catch(() => {});
  }
}
