import { useState } from 'react';
import { REFERENCE_RULES, type TableRules, houseEdge, rulesLabel } from '../../engine/rules';
import { Segmented, Toggle, formatPct } from '../ui';

/** Calculateur interactif de l'avantage de la maison selon les règles. */
export function HouseEdgeWidget() {
  const [r, setR] = useState<TableRules>(REFERENCE_RULES);
  const edge = houseEdge(r);
  const verdict = edge > 1 ? { t: 'À fuir', c: 'text-rose-400' } : edge > 0.5 ? { t: 'Médiocre', c: 'text-amber-300' } : { t: 'Bonne table', c: 'text-emerald-300' };
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-900/60 bg-slate-900/60 p-4">
      <div className="font-semibold text-slate-100">🧮 Calculateur : avantage de la maison</div>
      <div className="flex flex-wrap gap-4">
        <Segmented
          label="Jeux"
          value={r.decks}
          onChange={(decks) => setR({ ...r, decks })}
          options={[1, 2, 4, 6, 8].map((d) => ({ value: d, label: String(d) }))}
        />
        <Segmented
          label="Croupier"
          value={r.dealerHitsSoft17 ? 'H17' : 'S17'}
          onChange={(v) => setR({ ...r, dealerHitsSoft17: v === 'H17' })}
          options={[
            { value: 'S17', label: 'S17' },
            { value: 'H17', label: 'H17' },
          ]}
        />
        <Segmented
          label="Blackjack"
          value={r.blackjackPayout}
          onChange={(v) => setR({ ...r, blackjackPayout: v })}
          options={[
            { value: 1.5, label: '3:2' },
            { value: 1.2, label: '6:5' },
          ]}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <Toggle label="Double après séparation" checked={r.doubleAfterSplit} onChange={(v) => setR({ ...r, doubleAfterSplit: v })} />
        <Toggle label="Abandon tardif" checked={r.lateSurrender} onChange={(v) => setR({ ...r, lateSurrender: v })} />
        <Toggle label="Re-séparation des As" checked={r.resplitAces} onChange={(v) => setR({ ...r, resplitAces: v })} />
      </div>
      <div className="flex flex-wrap items-baseline gap-3 rounded-xl bg-slate-950/60 px-4 py-3">
        <span className="text-sm text-slate-400">Avantage de la maison ≈</span>
        <span className="text-3xl font-bold tabular-nums text-slate-50">{formatPct(edge).replace('+', '')}</span>
        <span className={`font-semibold ${verdict.c}`}>{verdict.t}</span>
      </div>
      <div className="text-xs text-slate-500">{rulesLabel(r)} — estimations par addition des effets de règles (ordres de grandeur, joueur de stratégie de base).</div>
    </div>
  );
}
