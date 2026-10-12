import type { NiveauDifficulte } from './difficulte';

export type ModeJeu = 'classique' | 'contre_la_montre' | 'survie' | 'blind_test' | 'defi' | 'duel' | 'entrainement';

export type InfoMode = {
  id: ModeJeu;
  nom: string;
  icone: string;
  description: string;
  /** Chrono par question, chrono global de la partie, ou aucun. */
  chrono: 'question' | 'global' | 'aucun';
  /** Le score est-il compté et affiché ? */
  score: boolean;
  /** Dégradé de la carte du mode. */
  degrade: string;
};

export const MODES: Record<ModeJeu, InfoMode> = {
  classique: { id: 'classique', nom: 'Classique', icone: '🎯', description: '10 ou 20 questions sur le thème de ton choix', chrono: 'question', score: true, degrade: 'from-amber-300 to-orange-400' },
  contre_la_montre: { id: 'contre_la_montre', nom: 'Contre-la-montre', icone: '⏱️', description: 'Un maximum de bonnes réponses en 60 secondes', chrono: 'global', score: true, degrade: 'from-sky-300 to-blue-400' },
  survie: { id: 'survie', nom: 'Survie', icone: '❤️', description: '3 vies, et la difficulté monte au fil des questions', chrono: 'question', score: true, degrade: 'from-rose-300 to-red-400' },
  blind_test: { id: 'blind_test', nom: 'Blind test', icone: '🎧', description: 'Extraits musicaux : réponds le plus vite possible', chrono: 'question', score: true, degrade: 'from-pink-300 to-fuchsia-400' },
  defi: { id: 'defi', nom: 'Défi du jour', icone: '📅', description: '10 questions identiques pour tout le monde, une fois par jour', chrono: 'question', score: true, degrade: 'from-emerald-300 to-teal-400' },
  duel: { id: 'duel', nom: 'Duel local', icone: '👥', description: '2 à 4 joueurs sur le même appareil, chacun son tour', chrono: 'question', score: true, degrade: 'from-violet-300 to-indigo-300' },
  entrainement: { id: 'entrainement', nom: 'Entraînement', icone: '🎓', description: 'Sans chrono ni score : on apprend à son rythme', chrono: 'aucun', score: false, degrade: 'from-lime-300 to-green-400' },
};

export const ORDRE_MODES: ModeJeu[] = ['classique', 'contre_la_montre', 'survie', 'blind_test', 'defi', 'duel', 'entrainement'];

export const CONTRE_LA_MONTRE = {
  /** Durée totale de la partie, en secondes. */
  duree: 60,
  /** Taille du stock de questions préparé. */
  stock: 80,
  /** Enchaînement automatique après la réponse (ms). */
  delaiBonne: 650,
  delaiMauvaise: 1400,
};

export const SURVIE = {
  vies: 3,
  /** La difficulté monte d'un cran toutes les N questions. */
  questionsParPalier: 5,
  stock: 120,
};

export const BLIND_TEST = {
  nombre: 10,
  /** Le bonus de rapidité compte double. */
  bonusRapiditeMax: 1,
};

export const DEFI = {
  nombre: 10,
  difficulte: 'moyen' as NiveauDifficulte,
};

export const DUEL = {
  minJoueurs: 2,
  maxJoueurs: 4,
  questionsParJoueur: [3, 5, 10] as const,
  couleurs: ['#8b5cf6', '#f59e0b', '#10b981', '#ec4899'],
};

/** Taille du stock de questions pour le mode adaptatif. */
export const STOCK_ADAPTATIF = 80;
