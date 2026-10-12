import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LISTE_CATEGORIES_JEU } from '@/config/categories';
import { T } from '@/i18n/fr';
import { banqueLocale } from '@/providers/local';
import { Logo } from '@/components/Layout';

const ICONES_MODES = ['⏱️', '❤️', '🎧', '📅', '👥', '🎓'];

export function Accueil() {
  return (
    <div className="space-y-10">
      <section className="pt-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
          <Logo grand />
        </motion.div>
        <p className="mx-auto mt-3 max-w-md text-lg text-slate-700 dark:text-slate-300">{T.accueil.sousTitre}</p>
        <motion.div className="mt-8" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/jouer"
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 px-10 py-5 font-display text-3xl font-extrabold text-white shadow-xl shadow-fuchsia-600/30"
          >
            <span aria-hidden>▶</span> {T.accueil.jouer}
          </Link>
        </motion.div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{T.accueil.stats(banqueLocale().length)}</p>
      </section>

      <section aria-labelledby="titre-modes">
        <h2 id="titre-modes" className="font-display text-2xl font-extrabold">
          {T.accueil.modes}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/jouer"
            className="col-span-2 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-slate-950 shadow-lg transition hover:-translate-y-1"
          >
            <span className="text-3xl" aria-hidden>
              🎯
            </span>
            <p className="font-display text-xl font-extrabold">{T.accueil.modeClassique}</p>
            <p className="text-sm font-semibold">{T.accueil.modeClassiqueDesc}</p>
          </Link>
          {T.accueil.autresModes.map((m, i) => (
            <div key={m} className="rounded-3xl border-2 border-dashed border-violet-200 p-4 text-slate-600 dark:border-slate-700 dark:text-slate-400" aria-disabled>
              <span className="text-2xl grayscale" aria-hidden>
                {ICONES_MODES[i]}
              </span>
              <p className="font-bold">{m}</p>
              <p className="text-xs font-semibold uppercase tracking-wide">{T.accueil.bientot}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Thèmes">
        <div className="flex flex-wrap justify-center gap-2">
          {LISTE_CATEGORIES_JEU.map((c) => (
            <span key={c.id} className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold shadow-sm dark:bg-slate-800/70">
              <span aria-hidden>{c.icone}</span> {c.nom}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
