import { motion } from 'framer-motion';
import { BADGES } from '@/config/progression';
import { T } from '@/i18n/fr';
import { useProfil } from '@/store/profil';
import { formaterDate, PageProgression } from './commun';

export function Badges() {
  const badges = useProfil((s) => s.badges);
  const obtenus = BADGES.filter((b) => badges[b.id]).length;
  // Les badges obtenus d'abord, puis ceux à débloquer.
  const tries = [...BADGES].sort((a, b) => Number(!!badges[b.id]) - Number(!!badges[a.id]));
  return (
    <PageProgression titre={`${T.profil.badges} · ${obtenus} / ${BADGES.length}`}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tries.map((b, i) => {
          const date = badges[b.id];
          return (
            <motion.li
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex h-full flex-col items-center rounded-3xl p-4 text-center shadow-sm ${date ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900'}`}
            >
              <span className={`text-4xl ${date ? '' : 'opacity-40 grayscale'}`} aria-hidden>
                {b.icone}
              </span>
              <p className="mt-1 font-display font-extrabold">{b.nom}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{b.description}</p>
              <p className={`mt-auto pt-2 text-xs font-bold ${date ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {date ? `✓ ${T.profil.obtenuLe(formaterDate(date))}` : `🔒 ${T.profil.verrouille}`}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </PageProgression>
  );
}
