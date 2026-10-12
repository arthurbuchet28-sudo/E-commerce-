import { useState } from 'react';
import { DiscardTray } from '../DiscardTray';
import { trueCount } from '../../engine/count';
import { formatSigned } from '../ui';

/** Démonstration : défausse, jeux restants et true count pour un running count donné. */
export function DiscardDemo() {
  const [discarded, setDiscarded] = useState(2);
  const [rc, setRc] = useState(8);
  const total = 6;
  const remaining = total - discarded;
  const tc = trueCount(rc, remaining, 'exact');
  return (
    <div className="grid items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-[auto_1fr]">
      <div className="flex justify-center">
        <DiscardTray decks={discarded} capacity={6} showScale label={`${discarded} jeux défaussés`} />
      </div>
      <div className="space-y-3">
        <label className="block text-sm text-slate-300">
          Jeux dans la défausse : <strong className="tabular-nums">{discarded.toString().replace('.', ',')}</strong>
          <input type="range" min={0} max={5.5} step={0.5} value={discarded} onChange={(e) => setDiscarded(Number(e.target.value))} className="mt-1 w-full accent-emerald-500" />
        </label>
        <label className="block text-sm text-slate-300">
          Running count : <strong className="tabular-nums">{formatSigned(rc)}</strong>
          <input type="range" min={-20} max={20} step={1} value={rc} onChange={(e) => setRc(Number(e.target.value))} className="mt-1 w-full accent-emerald-500" />
        </label>
        <div className="rounded-xl bg-slate-950/60 p-3 font-mono text-sm text-slate-200">
          Jeux restants = 6 − {discarded.toString().replace('.', ',')} = {remaining.toString().replace('.', ',')}
          <br />
          TC = {formatSigned(rc)} ÷ {remaining.toString().replace('.', ',')} = {formatSigned(tc, 2)}
          <br />
          TC arrondi (plancher) = <span className="text-lg font-bold text-amber-300">{formatSigned(trueCount(rc, remaining, 'floor'))}</span>
        </div>
      </div>
    </div>
  );
}
