/** Squelette animé pendant les chargements. */
export function Squelette({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-violet-200/60 dark:bg-slate-700/60 ${className}`} aria-hidden />;
}

export function SqueletteQuestion() {
  return (
    <div className="space-y-4" role="status" aria-label="Chargement">
      <Squelette className="h-6 w-40" />
      <Squelette className="h-24 w-full" />
      {[0, 1, 2, 3].map((i) => (
        <Squelette key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
