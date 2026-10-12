import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { forwardRef, useEffect } from 'react';
import { T } from '@/i18n/fr';

type Props = { score: number; reduit: boolean };

/** Score qui défile jusqu'à sa nouvelle valeur. */
export const CompteurScore = forwardRef<HTMLDivElement, Props>(function CompteurScore({ score, reduit }, ref) {
  const valeur = useMotionValue(score);
  const affiche = useTransform(valeur, (v) => Math.round(v).toLocaleString('fr-FR'));
  useEffect(() => {
    if (reduit) {
      valeur.set(score);
      return;
    }
    const controle = animate(valeur, score, { duration: 0.9, ease: 'easeOut', delay: 0.45 });
    return () => controle.stop();
  }, [score, reduit, valeur]);
  return (
    <div ref={ref} className="flex flex-col items-end" aria-live="polite">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{T.jeu.score}</span>
      <motion.span className="font-display text-2xl font-extrabold tabular-nums text-violet-700 dark:text-amber-300" aria-label={`${score} points`}>
        {affiche}
      </motion.span>
    </div>
  );
});
