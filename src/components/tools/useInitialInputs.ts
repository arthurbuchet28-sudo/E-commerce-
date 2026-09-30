"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * The page's query string, "" on the server and during hydration. Unlike `useSearchParams`, it
 * lets the tools be prerendered with their default values (no client-only placeholder, no
 * layout shift); `<UrlKeyed>` then remounts the tool when the URL carries a simulation.
 */
export function useSearch(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
}

/** Values of a reopened simulation, passed in the URL (?price=39&…). Only known keys are kept. */
export function useInitialInputs<K extends string>(keys: readonly K[]): Partial<Record<K, string>> {
  const params = new URLSearchParams(useSearch());
  const out: Partial<Record<K, string>> = {};
  for (const k of keys) {
    const v = params.get(k);
    if (v !== null && v.length <= 40) out[k] = v;
  }
  return out;
}

export function simulationHref(path: string, inputs: Record<string, string>): string {
  return `${path}?${new URLSearchParams(inputs).toString()}`;
}

/** Keeps only the listed keys that are present. */
export function pick<K extends string>(
  values: Partial<Record<string, string>>,
  keys: readonly K[],
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const k of keys) if (values[k] !== undefined) out[k] = values[k];
  return out;
}
