import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LISTE_CATEGORIES_JEU } from '@/config/categories';
import { NOMBRES_QUESTIONS } from '@/config/difficulte';
import { T } from '@/i18n/fr';
import { usePartie } from '@/store/partie';
import { useReglages } from '@/store/reglages';
import { SelecteurDifficulte } from '@/components/SelecteurDifficulte';

export function Configuration() {
  const navigate = useNavigate();
  const { derniereCategorie: categorie, derniereDifficulte: difficulte, dernierNombre: nombre, modifier } = useReglages();
  const { lancer, chargement, erreur } = usePartie();

  const demarrer = async () => {
    const ok = await lancer({ mode: 'classique', categorie, difficulte, nombreQuestions: nombre });
    if (ok) navigate('/partie');
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-extrabold">{T.config.titre}</h1>

      <fieldset>
        <legend className="font-display text-xl font-extrabold">{T.config.categorie}</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LISTE_CATEGORIES_JEU.map((c, i) => {
            const choisi = c.id === categorie;
            return (
              <motion.label
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                className={`relative cursor-pointer ${c.id === 'mix' ? 'col-span-2 sm:col-span-3' : ''}`}
              >
                <input
                  type="radio"
                  name="categorie"
                  value={c.id}
                  checked={choisi}
                  onChange={() => modifier({ derniereCategorie: c.id })}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-full min-h-24 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-3 text-white shadow-md transition peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-400 ${c.degrade} ${
                    choisi ? 'scale-[1.02] ring-4 ring-violet-900 ring-offset-2 ring-offset-violet-50 dark:ring-white dark:ring-offset-[#140c2e]' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl drop-shadow" aria-hidden>
                    {c.icone}
                  </span>
                  <span className="font-display text-lg font-extrabold leading-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.45)]">{c.nom}</span>
                  <span className="text-xs font-bold [text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">{c.accroche}</span>
                  {choisi && (
                    <span className="absolute right-3 top-3 rounded-full bg-white px-2 text-sm font-extrabold text-violet-800" aria-hidden>
                      ✓
                    </span>
                  )}
                </span>
              </motion.label>
            );
          })}
        </div>
      </fieldset>

      <SelecteurDifficulte valeur={difficulte} onChange={(d) => modifier({ derniereDifficulte: d })} />

      <fieldset>
        <legend className="font-display text-xl font-extrabold">{T.config.nombre}</legend>
        <div className="mt-2 flex gap-2">
          {NOMBRES_QUESTIONS.map((n) => (
            <label key={n}>
              <input type="radio" name="nombre" checked={nombre === n} onChange={() => modifier({ dernierNombre: n })} className="peer sr-only" />
              <span className="block cursor-pointer rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 font-display text-xl font-extrabold transition peer-checked:border-violet-700 peer-checked:bg-violet-700 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-amber-400 dark:border-slate-700 dark:bg-slate-800">
                {n}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {erreur && (
        <p role="alert" className="rounded-2xl bg-red-100 p-4 font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
          {T.config.erreur}
        </p>
      )}

      <div className="sticky bottom-4">
        <motion.button
          type="button"
          onClick={() => void demarrer()}
          disabled={chargement}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 py-5 font-display text-2xl font-extrabold text-white shadow-xl shadow-fuchsia-600/30 disabled:opacity-70"
        >
          {chargement ? T.config.chargement : `${T.config.lancer} 🚀`}
        </motion.button>
      </div>
    </div>
  );
}
