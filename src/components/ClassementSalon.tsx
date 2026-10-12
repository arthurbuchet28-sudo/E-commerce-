import { motion } from 'framer-motion';
import { Avatar } from '@/components/Avatar';
import { T } from '@/i18n/fr';
import type { JoueurSalon } from '@/store/multi';

const MEDAILLES = ['🥇', '🥈', '🥉'];

type Ligne = JoueurSalon & { rang: number };

/** Classement en direct des joueurs d'une manche (les lignes glissent quand les places changent). */
export function ClassementSalon({ lignes, compact = false, titre = T.multi.classement }: { lignes: Ligne[]; compact?: boolean; titre?: string }) {
  return (
    <section aria-label={titre} className="rounded-3xl bg-white p-3 shadow-md dark:bg-slate-800">
      {!compact && <h2 className="mb-2 px-1 font-display text-xl font-extrabold">{titre}</h2>}
      <ol className="space-y-1" aria-live="polite">
        {lignes.map((j) => (
          <motion.li
            layout
            key={j.id}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className={`flex items-center gap-2 rounded-2xl px-2 ${compact ? 'py-1' : 'py-2'} ${j.moi ? 'bg-violet-100 dark:bg-violet-950' : ''}`}
          >
            <span className="w-8 shrink-0 text-center font-display text-lg font-extrabold tabular-nums">
              {MEDAILLES[j.rang - 1] ?? <span className="text-base">{T.multi.rang(j.rang)}</span>}
            </span>
            <Avatar avatar={j.avatar} taille={compact ? 28 : 40} />
            <span className="min-w-0 flex-1 truncate font-bold">
              {j.pseudo}
              {j.moi && <span className="ml-1 text-sm font-semibold text-violet-700 dark:text-violet-300">({T.multi.toi})</span>}
            </span>
            <span className="shrink-0 text-sm font-semibold text-slate-600 tabular-nums dark:text-slate-300">
              {j.etat === 'fini' ? `✅ ${T.multi.fini}` : T.multi.progression(j.repondues, j.total)}
            </span>
            <span className="w-20 shrink-0 text-right font-display text-lg font-extrabold tabular-nums">{j.score.toLocaleString('fr-FR')}</span>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
