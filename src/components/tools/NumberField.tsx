"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/cn";
import { parseFrNumber } from "@/lib/calc/format";

type NumberFieldProps = {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  hint?: ReactNode;
  min?: number;
  max?: number;
  optional?: boolean;
};

/** Returns the error message to display for a raw input, or null. */
export function numberError(
  value: string,
  { min, max, optional }: Pick<NumberFieldProps, "min" | "max" | "optional">,
) {
  if (value.trim() === "") return optional ? null : "Saisissez un nombre.";
  const n = parseFrNumber(value);
  if (n === null) return "Saisissez un nombre, par exemple 12,50.";
  if (min !== undefined && n < min) return `Saisissez une valeur supérieure ou égale à ${min}.`;
  if (max !== undefined && n > max) return `Saisissez une valeur inférieure ou égale à ${max}.`;
  return null;
}

/** Text input accepting French-formatted numbers ("1 234,50"), with a visible unit. */
export function NumberField({
  id,
  label,
  value,
  onChange,
  unit,
  hint,
  min,
  max,
  optional,
}: NumberFieldProps) {
  const error = numberError(value, { min, max, optional });
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (facultatif)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-small text-muted">
          {hint}
        </p>
      )}
      <div className="flex items-stretch">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-11 w-full min-w-0 rounded-ui border border-border bg-sheet px-3 text-ui tabular-nums",
            unit && "rounded-r-none",
            error && "border-2 border-danger",
          )}
        />
        {unit && (
          <span
            aria-hidden
            className="flex items-center rounded-r-ui border border-l-0 border-border bg-ink-soft px-3 text-small"
          >
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-small font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Parses a field value, falling back to 0 for empty optional fields. */
export function num(value: string): number {
  return parseFrNumber(value) ?? 0;
}
