"use client";

import type { FormState } from "@/app/compte/actions";

import { ActionForm, AdminCheckbox } from "./ActionForm";

/** Deletion behind an explicit confirmation checkbox. */
export function DeleteForm({
  action,
  hidden,
  label,
  warning,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  hidden: Record<string, string>;
  label: string;
  warning: string;
}) {
  const idBase = `suppr-${Object.values(hidden).join("-")}`;
  return (
    <ActionForm action={action} submitLabel={label} variant="secondary">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <AdminCheckbox id={idBase} name="confirm" label={warning} />
    </ActionForm>
  );
}
