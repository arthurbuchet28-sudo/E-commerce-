import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
  danger: 'bg-rose-700 hover:bg-rose-600 text-white',
  gold: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function Panel({ children, className = '', title, actions }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg font-semibold text-slate-100">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) {
  const tones = {
    slate: 'bg-slate-800 text-slate-300',
    green: 'bg-emerald-900/70 text-emerald-300',
    amber: 'bg-amber-900/60 text-amber-300',
    red: 'bg-rose-900/60 text-rose-300',
    blue: 'bg-sky-900/60 text-sky-300',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl bg-slate-800/60 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-semibold tabular-nums text-slate-100">{value}</div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-800 ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <div className="inline-flex flex-wrap rounded-lg bg-slate-800 p-0.5" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-3 py-1 text-sm transition ${o.value === value ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 select-none">
      <input type="checkbox" className="h-4 w-4 accent-emerald-500" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm ${ok ? 'border-emerald-700 bg-emerald-950/60 text-emerald-200' : 'border-rose-700 bg-rose-950/60 text-rose-200'}`}
    >
      {children}
    </div>
  );
}

export function formatSigned(n: number, digits = 0): string {
  const s = n.toFixed(digits).replace('.', ',');
  return n > 0 ? `+${s}` : s.replace('-', '−');
}

export function formatPct(n: number, digits = 2): string {
  return `${formatSigned(n, digits)} %`;
}
