"use client";

import { useSearchParams } from "next/navigation";

/** Values of a reopened simulation, passed in the URL (?price=39&…). Only known keys are kept. */
export function useInitialInputs<K extends string>(keys: readonly K[]): Partial<Record<K, string>> {
  const params = useSearchParams();
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
