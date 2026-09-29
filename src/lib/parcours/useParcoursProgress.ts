"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { PARCOURS_STORAGE_VERSION, parcoursSteps } from "@/data/parcours";
import { writeLocal } from "@/lib/sync/localSync";

import {
  overallProgress,
  parseProgress,
  stepsProgress,
  toggleItem,
  type ParcoursProgress,
} from "./progress";

const KEY = `parcours:v${PARCOURS_STORAGE_VERSION}`;
const EVENT = "parcours-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // storage blocked: progress lives for this page only
  }
}

function write(progress: ParcoursProgress) {
  writeLocal(KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Progress of the path, stored in this browser. Server render and first paint show an
 * empty path (`hydrated: false`); the saved state appears right after hydration.
 * Phase 7 adds a sync with the member account behind the same interface.
 */
export function useParcoursProgress() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const progress = useMemo(() => parseProgress(raw, parcoursSteps), [raw]);
  const steps = useMemo(() => stepsProgress(progress, parcoursSteps), [progress]);
  const overall = useMemo(() => overallProgress(progress, parcoursSteps), [progress]);

  const toggle = useCallback(
    (slug: string, index: number) => write(toggleItem(progress, slug, index)),
    [progress],
  );
  const reset = useCallback(() => write(parseProgress(null, parcoursSteps)), []);

  return { progress, steps, overall, toggle, reset, hydrated };
}
