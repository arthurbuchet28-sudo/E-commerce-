import { motion, type TargetAndTransition } from 'framer-motion';
import { forwardRef } from 'react';

export type EtatBouton = 'neutre' | 'correct' | 'faux' | 'revele' | 'eteint' | 'masque';

type Props = {
  texte: string;
  index: number;
  etat: EtatBouton;
  desactive: boolean;
  onChoisir: () => void;
};

const STYLES: Record<EtatBouton, string> = {
  neutre:
    'bg-white text-slate-900 border-violet-200 hover:border-violet-500 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:border-violet-400',
  correct: 'bg-emerald-700 text-white border-emerald-500 shadow-lg shadow-emerald-500/30',
  faux: 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-500/30',
  revele: 'bg-emerald-700 text-white border-emerald-400 ring-4 ring-emerald-400/60',
  eteint: 'bg-white/60 text-slate-500 border-transparent dark:bg-slate-800/50 dark:text-slate-400',
  masque: 'bg-transparent text-transparent border-dashed border-slate-300 dark:border-slate-700',
};

const ANIMATIONS: Partial<Record<EtatBouton, TargetAndTransition>> = {
  correct: { scale: [1, 1.08, 1], transition: { duration: 0.35 } },
  faux: { x: [0, -12, 12, -9, 9, -4, 4, 0], transition: { duration: 0.5 } },
  revele: { scale: [1, 1.04, 1], transition: { duration: 0.6, delay: 0.25 } },
};

/** Bouton de réponse de QCM, avec retour visuel animé. */
export const BoutonReponse = forwardRef<HTMLButtonElement, Props>(function BoutonReponse(
  { texte, index, etat, desactive, onChoisir },
  ref,
) {
  const masque = etat === 'masque';
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onChoisir}
      disabled={desactive || masque}
      aria-hidden={masque}
      tabIndex={masque ? -1 : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: masque ? 0.35 : 1, y: 0, ...(ANIMATIONS[etat] ?? {}) }}
      transition={{ delay: index * 0.05 }}
      whileTap={desactive ? undefined : { scale: 0.97 }}
      className={`group relative flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition-[colors,transform,box-shadow] duration-200 sm:text-lg ${STYLES[etat]} ${desactive ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
          etat === 'neutre'
            ? 'bg-violet-100 text-violet-800 dark:bg-violet-500/25 dark:text-violet-100'
            : masque
              ? 'bg-transparent text-transparent'
              : 'bg-white/25 text-current'
        }`}
        aria-hidden
      >
        {index + 1}
      </span>
      <span className="flex-1">
        <span className="sr-only">{`Réponse ${index + 1} :`}</span> {texte}
      </span>
      {(etat === 'correct' || etat === 'revele') && <Coche />}
      {etat === 'faux' && <Croix />}
    </motion.button>
  );
});

function Coche() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden>
      <motion.circle cx="12" cy="12" r="11" fill="rgb(255 255 255 / 0.2)" initial={{ scale: 0 }} animate={{ scale: 1 }} />
      <motion.path
        d="M6.5 12.5l3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      />
    </svg>
  );
}

function Croix() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="rgb(255 255 255 / 0.2)" />
      <motion.path
        d="M8 8l8 8M16 8l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}
