"use client";

import { useState } from "react";

import { TextField } from "@/components/ui/Field";

type Props = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
  hint?: string;
};

/** Password input with an explicit « show password » option (helps typing on mobile). */
export function PasswordField({ id, name, label, autoComplete, error, hint }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <TextField
        id={id}
        name={name}
        label={label}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        error={error}
        hint={hint}
      />
      <label className="flex items-center gap-2 text-small">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="size-4 accent-ink"
        />
        Afficher le mot de passe
      </label>
    </div>
  );
}
