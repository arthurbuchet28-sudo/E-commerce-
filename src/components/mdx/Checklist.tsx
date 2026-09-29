"use client";

import { useId, useSyncExternalStore } from "react";

const storageKey = (id: string) => `checklist:${id}`;
const CHANGE_EVENT = "checklist-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function read(id: string): string | null {
  try {
    return localStorage.getItem(storageKey(id));
  } catch {
    return null; // Storage unavailable (private mode)
  }
}

function parse(raw: string | null, length: number): boolean[] {
  try {
    const saved = JSON.parse(raw ?? "[]") as unknown;
    if (Array.isArray(saved) && saved.length === length) return saved.map(Boolean);
  } catch {
    // ignore corrupted value
  }
  return Array.from({ length }, () => false);
}

/**
 * Tickable checklist. Progress is kept in this browser (localStorage); it is synced with
 * the account once authentication exists (phase 7). Items are never pre-checked.
 */
export function Checklist({ id, items, title }: { id: string; items: string[]; title?: string }) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(id),
    () => null,
  );
  const checked = parse(raw, items.length);
  const base = useId();

  function toggle(i: number) {
    const next = checked.map((c, j) => (j === i ? !c : c));
    try {
      localStorage.setItem(storageKey(id), JSON.stringify(next));
    } catch {
      // ignore: progress is simply not kept
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  const done = checked.filter(Boolean).length;
  return (
    <fieldset className="not-prose rounded-ui border border-line bg-sheet p-5 font-sans text-ui">
      <legend className="px-1 font-semibold">{title ?? "Checklist"}</legend>
      <p className="mb-3 text-small text-muted" aria-live="polite">
        {done} sur {items.length} point{items.length > 1 ? "s" : ""} validé{done > 1 ? "s" : ""}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-3">
            <input
              id={`${base}-${i}`}
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 size-5 shrink-0 accent-sage"
            />
            <label
              htmlFor={`${base}-${i}`}
              className={checked[i] ? "text-muted line-through" : undefined}
            >
              {item}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
