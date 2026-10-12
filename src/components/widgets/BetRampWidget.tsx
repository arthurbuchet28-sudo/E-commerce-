import { useMemo, useState } from 'react';
import {
  TC_MAX,
  TC_MIN,
  type BetRamp,
  bankrollForRisk,
  defaultRamp,
  evaluateRamp,
  probabilityOfLoss,
  rampSpread,
  riskOfRuin,
  simulateTrueCountFrequencies,
} from '../../engine/betting';
import { REFERENCE_RULES, houseEdge } from '../../engine/rules';
import { mulberry32 } from '../../engine/rng';
import { BarChart } from './BarChart';
import { Segmented, Stat, Toggle, formatPct } from '../ui';

const TCS = Array.from({ length: TC_MAX - TC_MIN + 1 }, (_, i) => TC_MIN + i);
const tcLabel = (tc: number) => (tc === TC_MIN ? `≤${tc}` : tc === TC_MAX ? `≥+${tc}` : tc > 0 ? `+${tc}` : String(tc));

/** Calculateur de rampe de mise : fréquences de TC simulées, espérance, variance, risque de ruine. */
export function BetRampWidget() {
  const [decks, setDecks] = useState(6);
  const [pen, setPen] = useState(0.75);
  const [h17, setH17] = useState(false);
  const [ramp, setRamp] = useState<BetRamp>(defaultRamp(8));
  const [wong, setWong] = useState(false);
  const [unit, setUnit] = useState(25);
  const [bankroll, setBankroll] = useState(1000);
  const [handsPerHour, setHandsPerHour] = useState(80);

  const freqs = useMemo(() => simulateTrueCountFrequencies({ decks, penetration: pen }, 2, 500, mulberry32(12345)), [decks, pen]);
  const he = houseEdge({ ...REFERENCE_RULES, decks, dealerHitsSoft17: h17 });
  const effective: BetRamp = useMemo(() => {
    if (!wong) return ramp;
    const r = { ...ramp };
    for (const tc of TCS) if (tc < 0) r[tc] = 0;
    return r;
  }, [ramp, wong]);
  const ev = evaluateRamp(effective, freqs, he);
  const hourEv = ev.evPerRound * handsPerHour * unit;
  const hourSd = ev.sdPerRound * Math.sqrt(handsPerHour) * unit;
  const ror = riskOfRuin(ev.evPerRound, ev.sdPerRound, bankroll);
  const need5 = bankrollForRisk(ev.evPerRound, ev.sdPerRound, 0.05);
  const loss100h = probabilityOfLoss(ev.evPerRound, ev.sdPerRound, handsPerHour * 100);
  const eur = (v: number) => `${Math.round(v).toLocaleString('fr-FR')} €`;

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-900/60 bg-slate-900/60 p-4">
      <div className="font-semibold text-slate-100">🧮 Calculateur de rampe de mise et de risque de ruine</div>
      <div className="flex flex-wrap gap-4">
        <Segmented label="Jeux" value={decks} onChange={setDecks} options={[2, 4, 6, 8].map((d) => ({ value: d, label: String(d) }))} />
        <Segmented label="Croupier" value={h17 ? 'H17' : 'S17'} onChange={(v) => setH17(v === 'H17')} options={[{ value: 'S17', label: 'S17' }, { value: 'H17', label: 'H17' }]} />
        <label className="text-sm text-slate-300">
          Pénétration : <strong>{Math.round(pen * 100)} %</strong>
          <input type="range" min={0.6} max={0.9} step={0.01} value={pen} onChange={(e) => setPen(Number(e.target.value))} className="block w-40 accent-emerald-500" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Rampe type"
          value={rampSpread(ramp)}
          onChange={(s) => setRamp(defaultRamp(s))}
          options={[4, 8, 12, 16].map((s) => ({ value: s, label: `1-${s}` }))}
        />
        <Toggle label="Wonging (ne pas jouer à TC < 0)" checked={wong} onChange={setWong} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-center text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="px-1 text-left">TC</th>
              {TCS.map((tc) => (
                <th key={tc} className="px-1">{tcLabel(tc)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-1 text-left text-slate-400">Mise (u)</td>
              {TCS.map((tc) => (
                <td key={tc} className="px-0.5">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    inputMode="numeric"
                    aria-label={`Mise à TC ${tcLabel(tc)}`}
                    value={effective[tc]}
                    disabled={wong && tc < 0}
                    onChange={(e) => setRamp({ ...ramp, [tc]: Math.max(0, Math.min(50, Number(e.target.value) || 0)) })}
                    className="w-12 rounded border border-slate-700 bg-slate-950 px-1 py-0.5 text-center tabular-nums disabled:opacity-40"
                  />
                </td>
              ))}
            </tr>
            <tr className="text-xs text-slate-500 tabular-nums">
              <td className="px-1 text-left">Fréquence</td>
              {TCS.map((tc) => (
                <td key={tc}>{(freqs[tc] * 100).toFixed(1).replace('.', ',')} %</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <BarChart ariaLabel="Fréquence des true counts" bars={TCS.map((tc) => ({ label: tcLabel(tc), value: Math.round(freqs[tc] * 1000) / 10 }))} format={(v) => `${String(v).replace('.', ',')} %`} height={160} positiveColor="#38bdf8" />
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="text-slate-300">Unité (€) <input type="number" min={1} value={unit} onChange={(e) => setUnit(Math.max(1, Number(e.target.value) || 1))} className="ml-1 w-20 rounded border border-slate-700 bg-slate-950 px-2 py-0.5" /></label>
        <label className="text-slate-300">Bankroll (unités) <input type="number" min={1} value={bankroll} onChange={(e) => setBankroll(Math.max(1, Number(e.target.value) || 1))} className="ml-1 w-24 rounded border border-slate-700 bg-slate-950 px-2 py-0.5" /></label>
        <label className="text-slate-300">Mains / heure <input type="number" min={10} value={handsPerHour} onChange={(e) => setHandsPerHour(Math.max(10, Number(e.target.value) || 10))} className="ml-1 w-20 rounded border border-slate-700 bg-slate-950 px-2 py-0.5" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Avantage moyen" value={formatPct(ev.edgePct)} hint={`maison à TC 0 : ${formatPct(-he)}`} />
        <Stat label="Gain / 100 mains" value={`${(ev.evPerRound * 100).toFixed(2).replace('.', ',')} u`} hint={`écart-type ${(ev.sdPerRound * 10).toFixed(1).replace('.', ',')} u`} />
        <Stat label="Gain espéré / h" value={eur(hourEv)} hint={`écart-type ±${eur(hourSd)}`} />
        <Stat label="N0" value={Number.isFinite(ev.n0) ? `${Math.round(ev.n0).toLocaleString('fr-FR')} mains` : '∞'} />
        <Stat label="Risque de ruine" value={`${(ror * 100).toFixed(1).replace('.', ',')} %`} hint={`bankroll ${bankroll.toLocaleString('fr-FR')} u`} />
        <Stat label="Bankroll pour 5 %" value={Number.isFinite(need5) ? `${Math.round(need5).toLocaleString('fr-FR')} u` : '∞'} hint={Number.isFinite(need5) ? eur(need5 * unit) : 'espérance ≤ 0'} />
        <Stat label="P(perte) après 100 h" value={`${Math.round(loss100h * 100)} %`} />
        <Stat label="Mains jouées" value={`${Math.round(ev.playedFraction * 100)} %`} hint={wong ? 'Wonging actif' : undefined} />
      </div>
      <p className="text-xs text-slate-500">
        Modèle simplifié : fréquences de TC simulées (2 joueurs à table), avantage ≈ −maison + 0,5 % par point de TC, variance 1,32 par main, sans déviations (qui ajoutent ≈ 0,1-0,2 %). RoR en horizon infini. Ordres de grandeur, pas une garantie.
      </p>
    </div>
  );
}
