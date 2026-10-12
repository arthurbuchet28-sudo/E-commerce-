import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { ResultatReponse } from '@/engine/partie';
import { T } from '@/i18n/fr';

type Props = {
  resultat: ResultatReponse;
  /** Bonne réponse à rappeler (null si la zone de réponse l'affiche déjà). */
  bonne: string | null;
  anecdote?: string;
  titre: string;
  derniere: boolean;
  /** Afficher les points gagnés (pas en entraînement). */
  avecPoints?: boolean;
  onSuivante: () => void;
};

/** Retour après la réponse : bravo / raté, bonne réponse et anecdote « Le saviez-vous ? ». */
export const CarteRevelation = forwardRef<HTMLButtonElement, Props>(function CarteRevelation(
  { resultat, bonne, anecdote, titre, derniere, avecPoints = true, onSuivante },
  ref,
) {
  const couleur = resultat.correct
    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    : resultat.fraction > 0
      ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40'
      : resultat.passee
      ? 'border-slate-300 bg-slate-50 dark:bg-slate-800/70'
      : 'border-red-300 bg-red-50 dark:bg-red-950/50';
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.15 }}
      className={`rounded-3xl border-2 p-5 ${couleur}`}
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold">{titre}</h2>
        {avecPoints && resultat.points.total > 0 && (
          <span className="font-display text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {T.jeu.pointsGagnes(resultat.points.total)}
          </span>
        )}
      </div>
      {!resultat.correct && bonne && (
        <p className="mt-1 text-sm">
          {T.jeu.bonneReponseEtait} <strong className="text-emerald-800 dark:text-emerald-300">{bonne}</strong>
        </p>
      )}
      {anecdote && (
        <div className="mt-4 rounded-2xl bg-white/80 p-4 dark:bg-slate-900/60">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            <span aria-hidden>💡</span> {T.jeu.leSaviezVous}
          </p>
          <p className="mt-1 leading-relaxed">{anecdote}</p>
        </div>
      )}
      <button
        ref={ref}
        type="button"
        onClick={onSuivante}
        className="mt-5 w-full rounded-2xl bg-violet-700 px-6 py-4 font-display text-xl font-extrabold text-white shadow-lg shadow-violet-700/30 transition hover:-translate-y-0.5 hover:bg-violet-800 active:translate-y-0"
      >
        {derniere ? T.jeu.resultats : T.jeu.suivante} →
      </button>
    </motion.section>
  );
});
