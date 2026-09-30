"use client";

import Link from "next/link";
import { useId } from "react";

import type { ParcoursOutline } from "@/data/parcours";
import { useParcoursProgress } from "@/lib/parcours/useParcoursProgress";

/** Checklist of one step, saved with the path progress. Items are never pre-checked. */
export function StepChecklist({
  outline,
  slug,
  items,
}: {
  outline: ParcoursOutline;
  slug: string;
  /** Checklist texts of this step only. */
  items: string[];
}) {
  const { progress, toggle } = useParcoursProgress(outline);
  const base = useId();
  const index = outline.steps.findIndex((s) => s.slug === slug);
  const next = outline.steps[index + 1];
  const checked = progress[slug] ?? items.map(() => false);
  const done = checked.filter(Boolean).length;
  const complete = done === items.length;

  return (
    <fieldset className="rounded-ui border border-line bg-sheet p-5">
      <legend className="px-1 font-semibold">Ma checklist pour cette étape</legend>
      <p className="mb-3 text-small text-muted" aria-live="polite">
        {complete
          ? "Étape terminée. Bravo."
          : `${done} point${done > 1 ? "s" : ""} validé${done > 1 ? "s" : ""} sur ${items.length}`}
      </p>
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-3">
            <input
              id={`${base}-${i}`}
              type="checkbox"
              checked={checked[i] ?? false}
              onChange={() => toggle(slug, i)}
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
      {complete && next && (
        <p className="mt-4">
          <Link href={next.href} className="link font-semibold">
            Passer à l’étape suivante : {next.title}
          </Link>
        </p>
      )}
    </fieldset>
  );
}
