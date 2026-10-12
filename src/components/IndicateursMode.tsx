import { AnimatePresence, motion } from 'framer-motion';
import type { NiveauDifficulte } from '@/config/difficulte';
import { DUEL, SURVIE } from '@/config/modes';
import type { EtatJoueur } from '@/engine/partie';
import { T } from '@/i18n/fr';

/** Survie : les vies restantes, avec un cœur qui se brise à chaque erreur. */
export function Coeurs({ vies }: { vies: number }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={T.jeu.vies(vies)}>
      {Array.from({ length: SURVIE.vies }, (_, i) => (
        <motion.span
          key={i}
          className="text-xl"
          animate={i < vies ? { scale: 1, opacity: 1, rotate: 0 } : { scale: [1.4, 0.8], opacity: 0.25, rotate: [0, -20] }}
          transition={{ duration: 0.5 }}
          aria-hidden
        >
          {i < vies ? '❤️' : '💔'}
        </motion.span>
      ))}
    </div>
  );
}

const COULEURS_NIVEAU: Record<NiveauDifficulte, string> = {
  facile: 'bg-emerald-700',
  moyen: 'bg-sky-700',
  difficile: 'bg-orange-700',
  expert: 'bg-red-700',
};

/** Niveau courant (adaptatif, survie). */
export function BadgeNiveau({ niveau }: { niveau: NiveauDifficulte }) {
  return (
    <motion.span
      key={niveau}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white ${COULEURS_NIVEAU[niveau]}`}
    >
      {T.difficultes[niveau]}
    </motion.span>
  );
}

/** Message éphémère quand la difficulté change. */
export function AnnonceNiveau({ changement, niveau }: { changement?: 'hausse' | 'baisse'; niveau: NiveauDifficulte }) {
  return (
    <AnimatePresence>
      {changement && (
        <motion.p
          key={`${changement}-${niveau}`}
          initial={{ y: -12, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className={`rounded-2xl px-4 py-2 text-center font-display text-lg font-extrabold text-white ${changement === 'hausse' ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-sky-700 to-emerald-700'}`}
          role="status"
        >
          {changement === 'hausse' ? `⬆️ ${T.jeu.niveauHausse(T.difficultes[niveau])}` : `⬇️ ${T.jeu.niveauBaisse(T.difficultes[niveau])}`}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/** Duel : scores de chaque joueur, joueur courant mis en avant. */
export function TableauDuel({ joueurs, courant, scoreCourant }: { joueurs: EtatJoueur[]; courant: number; scoreCourant: number }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Scores des joueurs">
      {joueurs.map((j, i) => (
        <span
          key={i}
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${i === courant ? 'text-white shadow-md' : 'bg-white/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
          style={i === courant ? { backgroundColor: DUEL.couleurs[i] } : undefined}
          aria-current={i === courant ? 'true' : undefined}
        >
          {i !== courant && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DUEL.couleurs[i] }} aria-hidden />}
          <span className="max-w-24 truncate">{j.nom}</span>
          <span className="tabular-nums">{(i === courant ? scoreCourant : j.score).toLocaleString('fr-FR')}</span>
        </span>
      ))}
    </div>
  );
}

/** Duel : écran de passage de relais (la question reste cachée tant que le joueur n'est pas prêt). */
export function EcranRelais({ nom, couleur, onPret }: { nom: string; couleur: string; onPret: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-3xl p-8 text-center text-white shadow-xl"
      style={{ background: `linear-gradient(135deg, ${couleur}, #312e81)` }}
      role="dialog"
      aria-labelledby="titre-relais"
    >
      <motion.span className="text-7xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }} aria-hidden>
        📱
      </motion.span>
      <h1 id="titre-relais" className="font-display text-4xl font-extrabold">
        {T.jeu.tourDe(nom)}
      </h1>
      <p className="max-w-xs font-semibold">{T.jeu.passeAppareil}</p>
      <button type="button" onClick={onPret} autoFocus className="rounded-full bg-white px-10 py-4 font-display text-2xl font-extrabold shadow-lg" style={{ color: couleur }}>
        {T.jeu.jePrends}
      </button>
    </motion.div>
  );
}
