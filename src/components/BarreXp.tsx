import { motion } from 'framer-motion';
import type { InfoNiveau } from '@/engine/progression';
import { T } from '@/i18n/fr';

/** Barre d'expérience du niveau en cours. `depuis` anime la progression depuis une valeur précédente. */
export function BarreXp({ info, xp, depuis }: { info: InfoNiveau; xp: number; depuis?: number }) {
  const pct = Math.round(info.progression * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-lg font-extrabold">
          {T.profil.niveau(info.niveau)} · <span className="text-violet-700 dark:text-violet-300">{info.titre}</span>
        </p>
        <p className="text-sm font-semibold tabular-nums text-slate-600 dark:text-slate-400">{T.profil.xp(xp - info.xpDebut, info.xpFin - info.xpDebut)}</p>
      </div>
      <div
        className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={T.profil.progressionNiveau(pct)}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
          initial={{ width: `${Math.round((depuis ?? info.progression) * 100)}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
