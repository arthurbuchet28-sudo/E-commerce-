import { useState } from 'react';
import { buildCharts, type ChartCode, type ChartRow } from '../engine/strategy';
import { REFERENCE_RULES, type TableRules } from '../engine/rules';
import { upValueLabel } from '../engine/cards';
import { Segmented, Toggle } from './ui';

export const CODE_STYLE: Record<ChartCode, string> = {
  H: 'bg-slate-200 text-slate-900',
  S: 'bg-amber-400 text-slate-900',
  D: 'bg-emerald-500 text-white',
  Ds: 'bg-emerald-700 text-white',
  P: 'bg-sky-500 text-white',
  R: 'bg-rose-600 text-white',
};

export const CODE_TEXT: Record<ChartCode, string> = {
  H: 'Tirer',
  S: 'Rester',
  D: 'Doubler, sinon tirer',
  Ds: 'Doubler, sinon rester',
  P: 'Séparer',
  R: 'Abandonner',
};

function Table({ title, rows, highlight }: { title: string; rows: ChartRow[]; highlight?: { row: string; col: number } }) {
  const dealers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[22rem] border-separate border-spacing-0.5 text-center text-xs sm:text-sm">
        <caption className="mb-1 text-left text-sm font-semibold text-slate-200">{title}</caption>
        <thead>
          <tr>
            <th className="px-1 text-left text-slate-400">Main</th>
            {dealers.map((d) => (
              <th key={d} scope="col" className="rounded bg-slate-800 px-1 py-1 text-slate-200">
                {upValueLabel(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="rounded bg-slate-800 px-1.5 py-1 text-left whitespace-nowrap text-slate-200">
                {r.label}
              </th>
              {r.cells.map((c, i) => (
                <td
                  key={i}
                  title={`${r.label} contre ${upValueLabel(dealers[i])} : ${CODE_TEXT[c]}`}
                  className={`rounded px-0.5 py-1 font-bold ${CODE_STYLE[c]} ${highlight && highlight.row === r.label && highlight.col === i ? 'ring-2 ring-fuchsia-400' : ''}`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StrategyLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {(Object.keys(CODE_STYLE) as ChartCode[]).map((c) => (
        <span key={c} className="flex items-center gap-1 text-slate-300">
          <span className={`inline-flex h-5 w-6 items-center justify-center rounded font-bold ${CODE_STYLE[c]}`}>{c}</span>
          {CODE_TEXT[c]}
        </span>
      ))}
    </div>
  );
}

export function StrategyCharts({ initialRules = REFERENCE_RULES, configurable = true }: { initialRules?: TableRules; configurable?: boolean }) {
  const [rules, setRules] = useState<TableRules>(initialRules);
  const [tab, setTab] = useState<'hard' | 'soft' | 'pairs' | 'surrender' | 'all'>('all');
  const charts = buildCharts(rules);
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
      {configurable && (
        <div className="flex flex-wrap items-center gap-4">
          <Segmented
            label="Croupier"
            value={rules.dealerHitsSoft17 ? 'H17' : 'S17'}
            options={[
              { value: 'S17', label: 'S17' },
              { value: 'H17', label: 'H17' },
            ]}
            onChange={(v) => setRules({ ...rules, dealerHitsSoft17: v === 'H17' })}
          />
          <Toggle label="Double après séparation (DAS)" checked={rules.doubleAfterSplit} onChange={(v) => setRules({ ...rules, doubleAfterSplit: v })} />
          <Toggle label="Abandon tardif" checked={rules.lateSurrender} onChange={(v) => setRules({ ...rules, lateSurrender: v })} />
        </div>
      )}
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'all', label: 'Tout' },
          { value: 'hard', label: 'Dures' },
          { value: 'soft', label: 'Soft' },
          { value: 'pairs', label: 'Paires' },
          { value: 'surrender', label: 'Abandon' },
        ]}
      />
      <StrategyLegend />
      <div className="grid gap-4 lg:grid-cols-2">
        {(tab === 'all' || tab === 'hard') && <Table title="Mains dures" rows={charts.hard} />}
        {(tab === 'all' || tab === 'soft') && <Table title="Mains soft" rows={charts.soft} />}
        {(tab === 'all' || tab === 'pairs') && <Table title={`Paires${rules.doubleAfterSplit ? ' (avec DAS)' : ' (sans DAS)'}`} rows={charts.pairs} />}
        {(tab === 'all' || tab === 'surrender') && (
          <div>
            <Table title={rules.lateSurrender ? 'Abandon tardif (prioritaire)' : 'Abandon (non autorisé ici)'} rows={charts.surrender} />
            <p className="mt-1 text-xs text-slate-400">Tableau consulté en premier, uniquement sur les deux premières cartes. Si l'abandon n'est pas possible, jouez la main selon les autres tableaux.</p>
          </div>
        )}
      </div>
    </div>
  );
}
