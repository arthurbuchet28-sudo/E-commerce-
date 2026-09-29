"use client";

import { useCallback, useSyncExternalStore } from "react";

import { writeLocal } from "@/lib/sync/localSync";

const EVENT = "local-json-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * Raw localStorage string for `key`, shared by every component using the same key.
 * Returns null on the server, before hydration, or when storage is unavailable.
 */
export function useLocalString(key: string): [string | null, (value: string | null) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const write = useCallback(
    (value: string | null) => {
      writeLocal(key, value);
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return [raw, write];
}
