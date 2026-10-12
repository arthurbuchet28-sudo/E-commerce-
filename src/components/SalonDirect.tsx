import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClassementSalon } from '@/components/ClassementSalon';
import { T } from '@/i18n/fr';
import { classementManche, useMulti } from '@/store/multi';

function useClassement(graine: string) {
  const joueurs = useMulti((s) => s.joueurs);
  return useMemo(() => classementManche(joueurs, graine), [joueurs, graine]);
}

/** Pendant la partie : classement compact, mis à jour à chaque réponse des joueurs. */
export function ClassementEnDirect({ graine }: { graine: string }) {
  const lignes = useClassement(graine);
  if (lignes.length < 2) return null;
  return <ClassementSalon lignes={lignes} compact titre={T.multi.classement} />;
}

/** Fin de manche : classement final (en direct tant que d'autres jouent) et suite du salon. */
export function ResultatsSalon({ graine }: { graine: string }) {
  const lignes = useClassement(graine);
  const { code, estHote, lancerManche, statut } = useMulti();
  const restants = lignes.filter((j) => j.etat !== 'fini').length;
  const premiers = lignes.filter((j) => j.rang === 1).map((j) => j.pseudo);
  return (
    <div className="space-y-4 text-left">
      {premiers.length > 0 && (
        <motion.p
          key={restants === 0 ? 'fin' : 'direct'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center font-display text-2xl font-extrabold text-violet-700 dark:text-amber-300"
          aria-live="polite"
        >
          {restants === 0 ? `🏆 ${T.multi.gagnant(premiers)}` : T.multi.enTete(premiers)}
        </motion.p>
      )}
      <p className="text-center font-semibold text-slate-600 dark:text-slate-400" aria-live="polite">
        {restants === 0 ? T.multi.tousFinis : T.multi.enAttente(restants)}
      </p>
      <ClassementSalon lignes={lignes} titre={restants === 0 ? T.multi.classementFinal : T.multi.classement} />
      {statut === 'connecte' && code && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {estHote && (
            <button type="button" onClick={lancerManche} className="rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 px-8 py-4 font-display text-xl font-extrabold text-white shadow-lg">
              🔁 {T.multi.nouvelleManche}
            </button>
          )}
          <Link to={`/salon/${code}`} className="rounded-full bg-cyan-300 px-8 py-4 text-center font-display text-xl font-extrabold text-slate-950 shadow-lg">
            📱 {T.multi.retourSalon}
          </Link>
        </div>
      )}
    </div>
  );
}
