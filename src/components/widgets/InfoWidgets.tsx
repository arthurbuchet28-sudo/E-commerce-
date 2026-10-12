import { DEALER_BUST_PCT } from '../../engine/strategy';
import { UP_VALUES, upValueLabel } from '../../engine/cards';
import { REFERENCE_RULES, houseEdge } from '../../engine/rules';
import { playerEdgeAtTrueCount, COUNTING_SYSTEMS } from '../../engine/count';
import { DEVIATIONS, formatIndex } from '../../engine/deviations';
import { ACTION_LABELS, type Action } from '../../engine/strategy';
import { BarChart } from './BarChart';
import { formatPct } from '../ui';

export function DealerBustChart() {
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-slate-200">Probabilité que le croupier saute, selon sa carte visible (sabot, S17)</div>
      <BarChart
        ariaLabel="Probabilité que le croupier saute selon sa carte visible"
        bars={UP_VALUES.map((v) => ({ label: upValueLabel(v), value: DEALER_BUST_PCT[v] }))}
        format={(v) => `${v} %`}
      />
      <p className="text-xs text-slate-400">Survolez une barre pour la valeur. Avec un As, ≈ 17 % lorsque le croupier n'a pas blackjack. Les cartes 2 à 6 (barres de gauche) sont nettement plus « faibles ».</p>
    </div>
  );
}

const EOR: [string, number][] = [
  ['2', 0.38], ['3', 0.44], ['4', 0.55], ['5', 0.69], ['6', 0.46], ['7', 0.28], ['8', 0], ['9', -0.18], ['10', -0.51], ['As', -0.61],
];

export function EorChart() {
  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-slate-200">Effet du retrait d'une carte sur l'avantage du joueur (jeu unique, en points de %)</div>
      <BarChart ariaLabel="Effet de retrait par carte" bars={EOR.map(([label, value]) => ({ label, value }))} format={(v) => formatPct(v)} />
      <p className="text-xs text-slate-400">Vert : retirer la carte aide le joueur (cartes basses, Hi-Lo +1). Rouge : retirer la carte nuit au joueur (cartes hautes, Hi-Lo −1).</p>
    </div>
  );
}

export function EdgeTable() {
  const he = houseEdge(REFERENCE_RULES);
  const heH17 = houseEdge({ ...REFERENCE_RULES, dealerHitsSoft17: true });
  const tcs = [-2, -1, 0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-200">Avantage approximatif du joueur selon le true count</div>
      <BarChart
        ariaLabel="Avantage du joueur selon le true count"
        bars={tcs.map((tc) => ({ label: tc > 0 ? `+${tc}` : String(tc), value: playerEdgeAtTrueCount(tc, he) }))}
        format={(v) => formatPct(v)}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-center text-sm">
          <thead>
            <tr className="bg-slate-800/70 text-slate-200">
              <th className="px-2 py-1 text-left">True count</th>
              {tcs.map((tc) => (
                <th key={tc} className="px-2 py-1">{tc > 0 ? `+${tc}` : tc}</th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr>
              <td className="px-2 py-1 text-left text-slate-400">Réf. S17</td>
              {tcs.map((tc) => {
                const e = playerEdgeAtTrueCount(tc, he);
                return <td key={tc} className={e > 0 ? 'text-emerald-300' : 'text-rose-300'}>{formatPct(e)}</td>;
              })}
            </tr>
            <tr>
              <td className="px-2 py-1 text-left text-slate-400">H17</td>
              {tcs.map((tc) => {
                const e = playerEdgeAtTrueCount(tc, heH17);
                return <td key={tc} className={e > 0 ? 'text-emerald-300' : 'text-rose-300'}>{formatPct(e)}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function actionName(a: Action | 'Ins' | 'NoIns'): string {
  if (a === 'Ins') return "Prendre l'assurance";
  if (a === 'NoIns') return "Refuser l'assurance";
  return ACTION_LABELS[a];
}

export function DeviationTable() {
  return (
    <div className="space-y-4">
      {(['I18', 'Fab4'] as const).map((g) => (
        <div key={g} className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="mb-1 text-left font-semibold text-slate-200">{g === 'I18' ? 'Illustrious 18 (par ordre de rentabilité)' : 'Fab 4 — abandons (abandon tardif requis)'}</caption>
            <thead>
              <tr className="bg-slate-800/70 text-left text-slate-200">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Main</th>
                <th className="px-2 py-1">Stratégie de base</th>
                <th className="px-2 py-1">Déviation</th>
                <th className="px-2 py-1">Quand</th>
              </tr>
            </thead>
            <tbody>
              {DEVIATIONS.filter((d) => d.group === g).map((d) => (
                <tr key={d.id} className="border-b border-slate-800 odd:bg-slate-900/40" title={d.note}>
                  <td className="px-2 py-1 text-slate-500">{d.rank}</td>
                  <td className="px-2 py-1 font-medium text-slate-100">{d.label.replace(' (abandon)', '')}</td>
                  <td className="px-2 py-1 text-slate-400">{actionName(d.basic)}</td>
                  <td className="px-2 py-1 text-amber-300">{actionName(d.deviation)}</td>
                  <td className="px-2 py-1 font-mono whitespace-nowrap text-emerald-300">{formatIndex(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p className="text-xs text-slate-400">Valable : sabot 4-8 jeux, S17, DAS, abandon tardif, Hi-Lo, true count arrondi à l'entier inférieur. Survolez une ligne pour les remarques.</p>
    </div>
  );
}

const SYSTEM_STATS: Record<string, { bc: number; pe: number; ic: number }> = {
  hilo: { bc: 0.97, pe: 0.51, ic: 0.76 },
  ko: { bc: 0.98, pe: 0.55, ic: 0.78 },
  omega2: { bc: 0.92, pe: 0.67, ic: 0.85 },
  zen: { bc: 0.96, pe: 0.63, ic: 0.85 },
};

export function SystemsTable() {
  const heads = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-center text-sm">
        <thead>
          <tr className="bg-slate-800/70 text-slate-200">
            <th className="px-2 py-1 text-left">Système</th>
            {heads.map((h) => (
              <th key={h} className="px-1 py-1">{h}</th>
            ))}
            <th className="px-2 py-1">Niv.</th>
            <th className="px-2 py-1">Équilibré</th>
            <th className="px-2 py-1">BC</th>
            <th className="px-2 py-1">PE</th>
            <th className="px-2 py-1">IC</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {COUNTING_SYSTEMS.map((s) => (
            <tr key={s.id} className="border-b border-slate-800">
              <td className="px-2 py-1 text-left font-medium text-slate-100">{s.name}</td>
              {s.tags.map((t, i) => (
                <td key={i} className={t > 0 ? 'text-emerald-300' : t < 0 ? 'text-rose-300' : 'text-slate-500'}>
                  {t > 0 ? `+${t}` : t}
                </td>
              ))}
              <td>{s.level}</td>
              <td>{s.balanced ? 'Oui' : 'Non'}</td>
              <td>{SYSTEM_STATS[s.id].bc.toFixed(2).replace('.', ',')}</td>
              <td>{SYSTEM_STATS[s.id].pe.toFixed(2).replace('.', ',')}</td>
              <td>{SYSTEM_STATS[s.id].ic.toFixed(2).replace('.', ',')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
