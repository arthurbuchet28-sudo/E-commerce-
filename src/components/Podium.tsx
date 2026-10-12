import { motion } from 'framer-motion';
import { DUEL } from '@/config/modes';
import type { ScoreJoueur } from '@/engine/partie';
import { T } from '@/i18n/fr';

const HAUTEURS = ['h-36', 'h-28', 'h-20', 'h-14'];
const MEDAILLES = ['🥇', '🥈', '🥉', '🎖️'];

/** Podium final du duel : 2e – 1er – 3e, puis le 4e. */
export function Podium({ classement, noms }: { classement: ScoreJoueur[]; noms: string[] }) {
  const ordreAffichage = classement.length >= 3 ? [classement[1]!, classement[0]!, classement[2]!, ...classement.slice(3)] : [...classement];
  const premiers = classement.filter((j) => j.rang === 1);
  return (
    <section aria-labelledby="titre-podium" className="space-y-4">
      <h2 id="titre-podium" className="font-display text-2xl font-extrabold">
        {T.resultats.podium}
      </h2>
      <p className="font-display text-xl font-extrabold text-violet-700 dark:text-amber-300">
        {premiers.length > 1 && premiers.length === classement.length ? T.resultats.egalite : T.resultats.vainqueur(premiers.map((j) => j.nom).join(' et '))}
      </p>
      <ol className="flex items-end justify-center gap-3">
        {ordreAffichage.map((j) => {
          const couleur = DUEL.couleurs[noms.indexOf(j.nom)] ?? '#8b5cf6';
          return (
            <motion.li
              key={j.nom}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + (3 - j.rang) * 0.35, type: 'spring', stiffness: 160, damping: 14 }}
              className="flex w-24 flex-col items-center"
              aria-label={`${j.rang}e : ${j.nom}, ${j.score} points`}
            >
              <span className="text-3xl" aria-hidden>
                {MEDAILLES[j.rang - 1]}
              </span>
              <span className="w-full truncate text-center font-bold">{j.nom}</span>
              <span className="text-sm font-semibold tabular-nums">{j.score.toLocaleString('fr-FR')} pts</span>
              <span className={`mt-1 flex w-full items-start justify-center rounded-t-2xl pt-2 font-display text-3xl font-extrabold text-white ${HAUTEURS[j.rang - 1]}`} style={{ backgroundColor: couleur }} aria-hidden>
                {j.rang}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
