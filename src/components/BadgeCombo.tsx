import { AnimatePresence, motion } from 'framer-motion';
import { multiplicateurCombo } from '@/engine/scoring';
import { T } from '@/i18n/fr';

type Props = { serie: number };

/** « Combo ×3 🔥 » : de plus en plus spectaculaire à ×5 et ×10. */
export function BadgeCombo({ serie }: Props) {
  const visible = serie >= 3;
  const palier = serie >= 10 ? 3 : serie >= 5 ? 2 : 1;
  const styles = {
    1: 'from-orange-500 to-red-500 text-base',
    2: 'from-pink-500 via-red-500 to-orange-400 text-lg shadow-lg shadow-orange-500/40',
    3: 'from-yellow-300 via-orange-500 to-fuchsia-600 text-xl shadow-xl shadow-yellow-400/50 ring-2 ring-yellow-300',
  }[palier];
  const flammes = '🔥'.repeat(palier);
  const mult = multiplicateurCombo(serie);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={palier}
          initial={{ scale: 0, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 font-display font-extrabold text-white ${styles}`}
          role="status"
        >
          <span>{T.jeu.combo(serie)}</span>
          <span className="inline-block animate-flamme" aria-hidden>
            {flammes}
          </span>
          {mult > 1 && <span className="rounded-full bg-white/25 px-1.5 text-xs">pts ×{String(mult).replace('.', ',')}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
