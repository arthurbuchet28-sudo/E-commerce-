import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "./cn";

const control =
  "w-full rounded-ui border border-border bg-sheet px-3 py-2 text-ui text-text placeholder:text-muted aria-[invalid=true]:border-danger aria-[invalid=true]:border-2";

function describedBy(id: string, hint?: ReactNode, error?: ReactNode) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={`${id}-hint`} className="text-small text-muted">
      {children}
    </p>
  );
}

function ErrorMessage({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={`${id}-error`} className="text-small font-semibold text-danger">
      {children}
    </p>
  );
}

type TextFieldProps = ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function TextField({ id, label, hint, error, className, ...props }: TextFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {props.required && <span className="font-normal text-muted"> (obligatoire)</span>}
      </label>
      <Hint id={id}>{hint}</Hint>
      <input
        id={id}
        className={cn(control, "min-h-11")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      />
      <ErrorMessage id={id}>{error}</ErrorMessage>
    </div>
  );
}

type TextAreaFieldProps = ComponentPropsWithoutRef<"textarea"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function TextAreaField({ id, label, hint, error, className, ...props }: TextAreaFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {props.required && <span className="font-normal text-muted"> (obligatoire)</span>}
      </label>
      <Hint id={id}>{hint}</Hint>
      <textarea
        id={id}
        className={cn(control, "min-h-24")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      />
      <ErrorMessage id={id}>{error}</ErrorMessage>
    </div>
  );
}

type SelectFieldProps = ComponentPropsWithoutRef<"select"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <Hint id={id}>{hint}</Hint>
      <select
        id={id}
        className={cn(control, "min-h-11")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      >
        {children}
      </select>
      <ErrorMessage id={id}>{error}</ErrorMessage>
    </div>
  );
}

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

/** Never pre-check a consent checkbox: pass `defaultChecked` only for user preferences. */
export function Checkbox({ id, label, hint, error, className, ...props }: CheckboxProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-ink"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...props}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      <div className="pl-8">
        <Hint id={id}>{hint}</Hint>
        <ErrorMessage id={id}>{error}</ErrorMessage>
      </div>
    </div>
  );
}

type RadioGroupProps = {
  name: string;
  legend: ReactNode;
  options: ReadonlyArray<{ value: string; label: ReactNode }>;
  defaultValue?: string;
  hint?: ReactNode;
  error?: ReactNode;
};

export function RadioGroup({ name, legend, options, defaultValue, hint, error }: RadioGroupProps) {
  const id = `rg-${name}`;
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={describedBy(id, hint, error)}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1 font-semibold">{legend}</legend>
      <Hint id={id}>{hint}</Hint>
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-3">
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="size-5 accent-ink"
          />
          {o.label}
        </label>
      ))}
      <ErrorMessage id={id}>{error}</ErrorMessage>
    </fieldset>
  );
}
