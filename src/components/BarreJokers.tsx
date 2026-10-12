import { JOKERS_DISPONIBLES, type Joker } from '@/config/difficulte';
import { T } from '@/i18n/fr';

const ICONES: Record<Joker, string> = { cinquante: '✂️', indice: '💡', passer: '⏭️', temps: '⏱️' };

type Props = {
  restants: number;
  utilises: Joker[];
  actif: boolean;
  onJoker: (j: Joker) => void;
};

export function BarreJokers({ restants, utilises, actif, onJoker }: Props) {
  if (restants === 0 && utilises.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Jokers : ${T.jokersRestants(restants)}`}>
      {JOKERS_DISPONIBLES.map((j) => {
        const deja = utilises.includes(j);
        const dispo = actif && !deja && restants > 0;
        return (
          <button
            key={j}
            type="button"
            onClick={() => onJoker(j)}
            disabled={!dispo}
            title={T.jokers[j].aide}
            aria-label={`${T.jokers[j].nom} : ${T.jokers[j].aide}`}
            className={`flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
              deja
                ? 'border-transparent bg-slate-200 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-500'
                : dispo
                  ? 'border-amber-400 bg-amber-100 text-amber-900 hover:-translate-y-0.5 hover:bg-amber-200 dark:bg-amber-400/15 dark:text-amber-200'
                  : 'border-slate-200 bg-white/50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
            }`}
          >
            <span aria-hidden>{ICONES[j]}</span>
            {T.jokers[j].nom}
          </button>
        );
      })}
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{T.jokersRestants(restants)}</span>
    </div>
  );
}
