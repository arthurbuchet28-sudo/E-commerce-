import { motion } from 'framer-motion';
import { T } from '@/i18n/fr';

type Props = { restant: number; total: number; actif: boolean; libelle?: string };

/** Chrono circulaire : vert → orange → rouge, pulse dans les 5 dernières secondes. */
export function Chrono({ restant, total, actif, libelle }: Props) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, restant / total)) : 0;
  const rayon = 26;
  const circonference = 2 * Math.PI * rayon;
  const couleur = ratio > 0.5 ? '#10b981' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
  const secondes = Math.ceil(restant);
  const urgent = actif && secondes <= 5 && restant > 0;
  return (
    <motion.div
      className="relative h-16 w-16 shrink-0"
      animate={urgent ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={urgent ? { duration: 0.8, repeat: Infinity } : undefined}
      role="timer"
      aria-label={libelle ?? T.jeu.secondes(secondes)}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={rayon} fill="none" strokeWidth="7" className="stroke-slate-200 dark:stroke-slate-700" />
        <circle
          cx="32"
          cy="32"
          r={rayon}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          stroke={couleur}
          strokeDasharray={circonference}
          strokeDashoffset={circonference * (1 - ratio)}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-xl font-extrabold tabular-nums"
        style={{ color: urgent ? couleur : undefined }}
        aria-hidden
      >
        {secondes}
      </span>
    </motion.div>
  );
}
