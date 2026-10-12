import { useMemo, useState } from 'react';
import { Button, formatSigned } from '../ui';

function gaussian(): number {
  let u = 0;
  while (u === 0) u = Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Simulation de trajectoires de bankroll (marche aléatoire par blocs de 100 mains)
 * pour visualiser la variance face à un faible avantage.
 */
export function VarianceSim() {
  const [ev100, setEv100] = useState(0.73);
  const [sd100] = useState(23.9);
  const [hands, setHands] = useState(20000);
  const [seed, setSeed] = useState(0);
  const N = 20;
  const steps = Math.max(1, Math.round(hands / 100));

  const paths = useMemo(() => {
    void seed;
    return Array.from({ length: N }, () => {
      const p = [0];
      for (let i = 0; i < steps; i++) p.push(p[i] + ev100 + sd100 * gaussian());
      return p;
    });
  }, [ev100, sd100, steps, seed]);

  const W = 640;
  const H = 280;
  const pad = { l: 44, r: 10, t: 12, b: 26 };
  const sdEnd = sd100 * Math.sqrt(steps);
  const all = paths.flat();
  const yMax = Math.max(...all, ev100 * steps + 2 * sdEnd);
  const yMin = Math.min(...all, ev100 * steps - 2 * sdEnd);
  const x = (i: number) => pad.l + (i / steps) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((yMax - v) / (yMax - yMin || 1)) * (H - pad.t - pad.b);
  const finals = paths.map((p) => p[p.length - 1]);
  const losers = finals.filter((f) => f < 0).length;

  const band = (k: number) => {
    const up: string[] = [];
    const down: string[] = [];
    for (let i = 0; i <= steps; i += Math.max(1, Math.floor(steps / 80))) {
      up.push(`${x(i)},${y(ev100 * i + k * sd100 * Math.sqrt(i))}`);
      down.unshift(`${x(i)},${y(ev100 * i - k * sd100 * Math.sqrt(i))}`);
    }
    return `M${up.join(' L')} L${down.join(' L')} Z`;
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="font-semibold text-slate-100">📈 Simulation : {N} compteurs, même avantage, résultats très différents</div>
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <label className="text-slate-300">
          Gain espéré / 100 mains : <strong>{formatSigned(ev100, 2)} u</strong>
          <input type="range" min={-0.5} max={3} step={0.05} value={ev100} onChange={(e) => setEv100(Number(e.target.value))} className="block w-48 accent-emerald-500" />
        </label>
        <label className="text-slate-300">
          Nombre de mains : <strong>{hands.toLocaleString('fr-FR')}</strong>
          <input type="range" min={1000} max={100000} step={1000} value={hands} onChange={(e) => setHands(Number(e.target.value))} className="block w-48 accent-emerald-500" />
        </label>
        <Button variant="secondary" onClick={() => setSeed((s) => s + 1)}>Relancer</Button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trajectoires de bankroll simulées">
        <path d={band(2)} fill="#334155" opacity="0.35" />
        <path d={band(1)} fill="#334155" opacity="0.5" />
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="#64748b" strokeDasharray="4 4" />
        <text x={pad.l - 6} y={y(0) + 4} fontSize="11" fill="#94a3b8" textAnchor="end">0</text>
        <text x={pad.l - 6} y={y(yMax) + 10} fontSize="11" fill="#94a3b8" textAnchor="end">{Math.round(yMax)}</text>
        <text x={pad.l - 6} y={y(yMin)} fontSize="11" fill="#94a3b8" textAnchor="end">{Math.round(yMin)}</text>
        {paths.map((p, k) => (
          <polyline
            key={k}
            fill="none"
            stroke={p[p.length - 1] >= 0 ? '#34d399' : '#fb7185'}
            strokeOpacity="0.55"
            strokeWidth="1.2"
            points={p.filter((_, i) => i % Math.max(1, Math.floor(steps / 200)) === 0 || i === steps).map((v, i, arr) => `${x(i === arr.length - 1 ? steps : i * Math.max(1, Math.floor(steps / 200)))},${y(v)}`).join(' ')}
          />
        ))}
        <line x1={x(0)} y1={y(0)} x2={x(steps)} y2={y(ev100 * steps)} stroke="#fbbf24" strokeWidth="2" />
        <text x={W - pad.r} y={H - 6} fontSize="11" fill="#94a3b8" textAnchor="end">{hands.toLocaleString('fr-FR')} mains</text>
        <text x={pad.l} y={H - 6} fontSize="11" fill="#94a3b8">0</text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span><span className="mr-1 inline-block h-0.5 w-4 bg-amber-400 align-middle" />Gain espéré</span>
        <span><span className="mr-1 inline-block h-3 w-4 bg-slate-600 align-middle" />±1 et ±2 écarts-types</span>
        <span><span className="mr-1 inline-block h-0.5 w-4 bg-emerald-400 align-middle" />trajectoire finie en gain</span>
        <span><span className="mr-1 inline-block h-0.5 w-4 bg-rose-400 align-middle" />trajectoire finie en perte</span>
      </div>
      <p className="text-sm text-slate-300">
        Résultat : <strong>{losers}</strong> compteurs sur {N} finissent en perte après {hands.toLocaleString('fr-FR')} mains, alors qu'ils ont tous le même avantage. Gain espéré : {formatSigned(ev100 * steps, 0)} unités ; écart-type : ±{Math.round(sdEnd)} unités.
      </p>
    </div>
  );
}
