import { DIFFICULTES, ORDRE_DIFFICULTES, ADAPTATIF, type ChoixDifficulte } from '@/config/difficulte';
import { T } from '@/i18n/fr';

const COULEURS: Record<ChoixDifficulte, string> = {
  facile: 'peer-checked:bg-emerald-700 peer-checked:border-emerald-700',
  moyen: 'peer-checked:bg-sky-700 peer-checked:border-sky-700',
  difficile: 'peer-checked:bg-orange-700 peer-checked:border-orange-700',
  expert: 'peer-checked:bg-red-700 peer-checked:border-red-700',
  adaptatif: 'peer-checked:bg-violet-700 peer-checked:border-violet-700',
};
const ICONES: Record<ChoixDifficulte, string> = { facile: '🌱', moyen: '🌶️', difficile: '🌶️🌶️', expert: '🔥', adaptatif: '🧭' };

type Props = {
  valeur: ChoixDifficulte;
  onChange: (d: ChoixDifficulte) => void;
  avecAdaptatif?: boolean;
  titre?: string;
};

export function SelecteurDifficulte({ valeur, onChange, avecAdaptatif = true, titre = T.config.difficulte }: Props) {
  const choix: ChoixDifficulte[] = avecAdaptatif ? [...ORDRE_DIFFICULTES, 'adaptatif'] : ORDRE_DIFFICULTES;
  const p = DIFFICULTES[valeur === 'adaptatif' ? ADAPTATIF.depart : valeur];
  return (
    <fieldset>
      <legend className="font-display text-xl font-extrabold">{titre}</legend>
      <div className={`mt-2 grid grid-cols-2 gap-2 ${avecAdaptatif ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
        {choix.map((d) => (
          <label key={d} className={`relative ${d === 'adaptatif' ? 'col-span-2 sm:col-span-1' : ''}`}>
            <input type="radio" name="difficulte" value={d} checked={valeur === d} onChange={() => onChange(d)} className="peer sr-only" />
            <span
              className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 font-bold transition peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-amber-400 dark:border-slate-700 dark:bg-slate-800 ${COULEURS[d]}`}
            >
              <span aria-hidden>{ICONES[d]}</span>
              {T.difficultes[d]}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
        {valeur === 'adaptatif' ? T.config.adaptatifAide : T.config.details(p.tempsParQuestion, p.nbChoix, p.jokers, p.multiplicateur)}
      </p>
    </fieldset>
  );
}
