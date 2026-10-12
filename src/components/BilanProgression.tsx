import { motion } from 'framer-motion';
import { niveauDepuisXp } from '@/engine/progression';
import { T } from '@/i18n/fr';
import type { BilanProgression as Bilan } from '@/store/profil';
import { useProfil } from '@/store/profil';
import { BarreXp } from './BarreXp';

/** XP gagnée, passage de niveau et badges débloqués, en fin de partie. */
export function BilanProgression({ bilan }: { bilan: Bilan }) {
  const xp = useProfil((s) => s.xp);
  const monte = bilan.apres.niveau > bilan.avant.niveau;
  return (
    <section className="space-y-4 rounded-3xl bg-white p-5 text-left shadow-md dark:bg-slate-800" aria-labelledby="titre-bilan">
      <div className="flex items-center justify-between">
        <h2 id="titre-bilan" className="font-display text-xl font-extrabold">
          {T.profil.progression}
        </h2>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.4 }}
          className="rounded-full bg-violet-100 px-3 py-1 font-display font-extrabold text-violet-800 dark:bg-violet-500/25 dark:text-violet-100"
        >
          {T.profil.xpGagnee(bilan.xpGagne)}
        </motion.span>
      </div>
      <BarreXp info={niveauDepuisXp(xp)} xp={xp} depuis={monte ? 0 : bilan.avant.progression} />
      {monte && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 p-3 text-center font-display text-lg font-extrabold text-slate-950"
          role="status"
        >
          ⬆️ {T.profil.niveauAtteint(bilan.apres.niveau, bilan.apres.titre)}
        </motion.p>
      )}
      {bilan.badges.length > 0 && (
        <div>
          <p className="font-bold">{T.profil.nouveauxBadges(bilan.badges.length)}</p>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {bilan.badges.map((b, i) => (
              <motion.li
                key={b.id}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.8 + i * 0.2, type: 'spring', stiffness: 260, damping: 12 }}
                className="flex items-center gap-2 rounded-2xl bg-amber-50 p-2 dark:bg-amber-400/10"
              >
                <span className="text-3xl" aria-hidden>
                  {b.icone}
                </span>
                <span>
                  <span className="block text-sm font-extrabold">{b.nom}</span>
                  <span className="block text-xs text-slate-600 dark:text-slate-400">{b.description}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
