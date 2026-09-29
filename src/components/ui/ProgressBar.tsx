type ProgressBarProps = { value: number; max?: number; label: string };

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-small">
        <span>{label}</span>
        <span className="text-muted tabular-nums">{Math.round(pct)} %</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-2.5 overflow-hidden rounded-full border border-border bg-sheet"
      >
        <div className="h-full rounded-full bg-sage" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
