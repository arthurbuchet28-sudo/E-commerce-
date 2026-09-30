"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { ParcoursOutline } from "@/data/parcours";
import { writeLocal } from "@/lib/sync/localSync";

import {
  overallProgress,
  parseProgress,
  stepsProgress,
  toggleItem,
  type ParcoursProgress,
} from "./progress";

const EVENT = "parcours-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage blocked: progress lives for this page only
  }
}

function write(key: string, progress: ParcoursProgress) {
  writeLocal(key, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Progress of the path, stored in this browser. Server render and first paint show an
 * empty path (`hydrated: false`); the saved state appears right after hydration.
 * Phase 7 adds a sync with the member account behind the same interface.
 */
export function useParcoursProgress({ storageKey, steps: outline }: ParcoursOutline) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(storageKey),
    () => null,
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const progress = useMemo(() => parseProgress(raw, outline), [raw, outline]);
  const steps = useMemo(() => stepsProgress(progress, outline), [progress, outline]);
  const overall = useMemo(() => overallProgress(progress, outline), [progress, outline]);

  const toggle = useCallback(
    (slug: string, index: number) => write(storageKey, toggleItem(progress, slug, index)),
    [progress, storageKey],
  );
  const reset = useCallback(
    () => write(storageKey, parseProgress(null, outline)),
    [storageKey, outline],
  );

  return { progress, steps, overall, toggle, reset, hydrated };
}
