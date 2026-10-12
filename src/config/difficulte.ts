import type { NiveauQuestion } from '@/types/question';

export type NiveauDifficulte = 'facile' | 'moyen' | 'difficile' | 'expert';
export type ChoixDifficulte = NiveauDifficulte | 'adaptatif';

export type Joker = 'cinquante' | 'indice' | 'passer' | 'temps';

export type ToleranceSaisie = 'large' | 'moyenne' | 'faible' | 'stricte';

export type ParametresDifficulte = {
  /** Niveaux de questions autorisés. */
  niveaux: NiveauQuestion[];
  /** Nombre de choix affichés en QCM. */
  nbChoix: number;
  /** Temps par question, en secondes. */
  tempsParQuestion: number;
  /** Nombre total de jokers utilisables dans la partie. */
  jokers: number;
  tolerance: ToleranceSaisie;
  /** Multiplicateur de points. */
  multiplicateur: number;
};

/**
 * Toute la configuration de la difficulté est ici.
 * Modifier ce fichier suffit pour rééquilibrer le jeu.
 */
export const DIFFICULTES: Record<NiveauDifficulte, ParametresDifficulte> = {
  facile: { niveaux: [1], nbChoix: 3, tempsParQuestion: 30, jokers: 3, tolerance: 'large', multiplicateur: 1 },
  moyen: { niveaux: [1, 2], nbChoix: 4, tempsParQuestion: 20, jokers: 2, tolerance: 'moyenne', multiplicateur: 1.5 },
  difficile: { niveaux: [2, 3], nbChoix: 4, tempsParQuestion: 15, jokers: 1, tolerance: 'faible', multiplicateur: 2 },
  expert: { niveaux: [3, 4], nbChoix: 6, tempsParQuestion: 10, jokers: 0, tolerance: 'stricte', multiplicateur: 3 },
};

export const ORDRE_DIFFICULTES: NiveauDifficulte[] = ['facile', 'moyen', 'difficile', 'expert'];

/** Distance de Levenshtein maximale tolérée (en fraction de la longueur de la réponse). */
export const TOLERANCE_LEVENSHTEIN: Record<ToleranceSaisie, number> = {
  large: 0.34,
  moyenne: 0.25,
  faible: 0.15,
  stricte: 0,
};

/** Mode adaptatif : seuils de changement de niveau. */
export const ADAPTATIF = {
  depart: 'moyen' as NiveauDifficulte,
  monteeApresBonnes: 3,
  descenteApresErreurs: 2,
};

/** Jokers proposés dans la barre (dans cet ordre). */
export const JOKERS_DISPONIBLES: Joker[] = ['cinquante', 'indice', 'passer', 'temps'];
export const BONUS_TEMPS_JOKER = 10;

/** Barème de base. */
export const POINTS = {
  base: 100,
  /** Bonus de rapidité maximal (fraction de la base) si réponse instantanée. */
  bonusRapiditeMax: 0.5,
  /** Paliers de combo : série minimale → multiplicateur. */
  paliersCombo: [
    { serie: 10, multiplicateur: 3 },
    { serie: 5, multiplicateur: 2 },
    { serie: 3, multiplicateur: 1.5 },
  ],
};

/** Seuils d'étoiles selon la précision (0 → 1). */
export const ETOILES = { deux: 0.5, trois: 0.8 };

export const NOMBRES_QUESTIONS = [10, 20] as const;
