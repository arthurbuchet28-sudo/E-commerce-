import { PageHeader } from '../components/Layout';
import { StrategyCharts } from '../components/StrategyChart';
import { DeviationTable } from '../components/widgets/widgets';
import { Panel } from '../components/ui';
import { PlayingCard } from '../components/PlayingCard';
import type { Card } from '../engine/cards';

const sample = (ranks: string[]): Card[] => ranks.map((r, i) => ({ rank: r as Card['rank'], suit: (['♠', '♥', '♦', '♣'] as const)[i % 4] }));

export function CheatSheetPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader kicker="Référence" title="Aide-mémoire" subtitle="Stratégie de base, valeurs Hi-Lo, true count et déviations sur une seule page. À utiliser pour réviser, jamais à la table." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Valeurs Hi-Lo">
          {[
            { v: '+1', ranks: ['2', '3', '4', '5', '6'], c: 'text-emerald-300' },
            { v: '0', ranks: ['7', '8', '9'], c: 'text-slate-300' },
            { v: '−1', ranks: ['10', 'J', 'Q', 'K', 'A'], c: 'text-rose-300' },
          ].map((row) => (
            <div key={row.v} className="mb-2 flex items-center gap-3">
              <span className={`w-10 text-2xl font-bold ${row.c}`}>{row.v}</span>
              <div className="flex flex-wrap gap-1">
                {sample(row.ranks).map((c, i) => (
                  <PlayingCard key={i} card={c} size="xs" />
                ))}
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="Formules">
          <ul className="space-y-2 text-sm text-slate-300">
            <li><strong>True count</strong> = running count ÷ jeux restants (arrondi à l'entier inférieur).</li>
            <li><strong>Jeux restants</strong> = jeux du sabot − jeux dans la défausse.</li>
            <li><strong>Avantage</strong> ≈ −avantage maison + 0,5 % × TC (équilibre vers TC +1).</li>
            <li><strong>Assurance</strong> : uniquement si TC ≥ +3.</li>
            <li><strong>Rampe 1-8</strong> : 1 u jusqu'à TC +1, puis (TC − 1) × 2 u, maximum 8 u.</li>
            <li><strong>Risque de ruine</strong> ≈ exp(−2·E·B / σ²).</li>
          </ul>
        </Panel>
      </div>
      <Panel title="Stratégie de base (6 jeux, S17, DAS, abandon tardif)">
        <StrategyCharts />
      </Panel>
      <Panel title="Déviations : Illustrious 18 et Fab 4">
        <DeviationTable />
      </Panel>
    </div>
  );
}
