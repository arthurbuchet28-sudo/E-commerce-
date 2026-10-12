import { useCallback, useEffect, useRef, useState } from 'react';

/** Chronomètre basé sur performance.now(), rafraîchi ~10 fois par seconde. */
export function useStopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed(performance.now() - start.current), 100);
    return () => window.clearInterval(id);
  }, [running]);

  const begin = useCallback(() => {
    start.current = performance.now();
    setElapsed(0);
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    const t = performance.now() - start.current;
    setElapsed(t);
    setRunning(false);
    return t;
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  return { running, elapsed, begin, stop, reset };
}

export function formatSeconds(ms: number, digits = 1): string {
  return `${(ms / 1000).toFixed(digits).replace('.', ',')} s`;
}

export function TimerDisplay({ ms, target }: { ms: number; target?: number }) {
  const over = target !== undefined && ms > target;
  return (
    <div className={`font-mono text-3xl tabular-nums ${over ? 'text-rose-400' : 'text-emerald-300'}`} aria-live="off">
      ⏱ {formatSeconds(ms)}
    </div>
  );
}
