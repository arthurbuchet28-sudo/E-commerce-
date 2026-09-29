import type { ReactNode } from "react";

import { cn } from "./cn";

export type CalcRow = {
  label: ReactNode;
  /** Pre-formatted value (fr-FR), e.g. "12,00 €". */
  value: string;
  hint?: ReactNode;
  kind?: "input" | "subtotal" | "total";
};

/**
 * « Fiche de calcul » (borrowed from direction B): ruled lines, dotted leaders, tabular
 * figures and a double-underlined total. Wrap results in an aria-live region when they update.
 */
export function CalcSheet({
  title,
  rows,
  note,
}: {
  title: string;
  rows: CalcRow[];
  note?: ReactNode;
}) {
  return (
    <figure className="rounded-ui border border-line bg-sheet p-5">
      <figcaption className="mb-3 font-serif text-h3 font-semibold text-ink">{title}</figcaption>
      <dl className="tabular-nums">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex items-baseline gap-2 border-b border-line py-2",
              row.kind === "subtotal" && "font-semibold",
              row.kind === "total" &&
                "border-b-[3px] border-double border-text text-lead font-bold",
            )}
          >
            <dt className="shrink-0">
              {row.label}
              {row.hint && (
                <span className="block text-small font-normal text-muted">{row.hint}</span>
              )}
            </dt>
            <span
              aria-hidden
              className="mb-1 min-w-4 flex-1 border-b border-dotted border-border"
            />
            <dd className="shrink-0 text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-3 text-small text-muted">{note}</p>}
    </figure>
  );
}
