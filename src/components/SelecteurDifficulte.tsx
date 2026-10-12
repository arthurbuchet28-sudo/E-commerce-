import { DIFFICULTES, ORDRE_DIFFICULTES, type NiveauDifficulte } from '@/config/difficulte';
import { T } from '@/i18n/fr';

const COULEURS: Record<NiveauDifficulte, string> = {
  facile: 'peer-checked:bg-emerald-600 peer-checked:border-emerald-600',
  moyen: 'peer-checked:bg-sky-600 peer-checked:border-sky-600',
  difficile: 'peer-checked:bg-orange-600 peer-checked:border-orange-600',
  expert: 'peer-checked:bg-red-600 peer-checked:border-red-600',
};
const PIMENTS: Record<NiveauDifficulte, string> = { facile: '🌱', moyen: '🌶️', difficile: '🌶️🌶️', expert: '🔥' };

type Props = { valeur: NiveauDifficulte; onChange: (d: NiveauDifficulte) => void };

export function SelecteurDifficulte({ valeur, onChange }: Props) {
  const p = DIFFICULTES[valeur];
  return (
    <fieldset>
      <legend className="font-display text-xl font-extrabold">{T.config.difficulte}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ORDRE_DIFFICULTES.map((d) => (
          <label key={d} className="relative">
            <input type="radio" name="difficulte" value={d} checked={valeur === d} onChange={() => onChange(d)} className="peer sr-only" />
            <span
              className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 font-bold transition peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-amber-400 dark:border-slate-700 dark:bg-slate-800 ${COULEURS[d]}`}
            >
              <span aria-hidden>{PIMENTS[d]}</span>
              {T.difficultes[d]}
            </span>
          </label>
        ))}
        <span
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400"
          title={T.accueil.bientot}
        >
          <span aria-hidden>🧭</span>
          Adaptatif
          <span className="text-[10px] uppercase">{T.accueil.bientot}</span>
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
        {T.config.details(p.tempsParQuestion, p.nbChoix, p.jokers, p.multiplicateur)}
      </p>
    </fieldset>
  );
}
