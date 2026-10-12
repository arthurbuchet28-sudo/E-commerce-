import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui';

/** Saisie d'un compte entier (signé), avec boutons +/- pratiques sur mobile. */
export function CountInput({ onSubmit, label = 'Votre running count', autoFocus = true }: { onSubmit: (v: number) => void; label?: string; autoFocus?: boolean }) {
  const [value, setValue] = useState('');
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const n = Number(value.replace('−', '-').replace('+', ''));
    if (value.trim() === '' || !Number.isFinite(n)) return;
    onSubmit(Math.trunc(n));
    setValue('');
  };
  const step = (d: number) => setValue((v) => String((Number(v.replace('−', '-')) || 0) + d));
  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col text-sm text-slate-300">
        {label}
        <input
          autoFocus={autoFocus}
          inputMode="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-28 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-center text-2xl tabular-nums text-white"
          placeholder="0"
          aria-label={label}
        />
      </label>
      <Button type="button" variant="secondary" onClick={() => step(-1)} aria-label="Moins un">−1</Button>
      <Button type="button" variant="secondary" onClick={() => step(1)} aria-label="Plus un">+1</Button>
      <Button type="submit">Valider</Button>
    </form>
  );
}
