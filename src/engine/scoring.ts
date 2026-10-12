import { DIFFICULTES, ETOILES, POINTS, type NiveauDifficulte } from '@/config/difficulte';

/** Multiplicateur de combo selon la série de bonnes réponses en cours (incluant la réponse actuelle). */
export function multiplicateurCombo(serie: number): number {
  for (const palier of POINTS.paliersCombo) {
    if (serie >= palier.serie) return palier.multiplicateur;
  }
  return 1;
}

export type CalculPoints = {
  correct: boolean;
  /** Part des points obtenue (0 → 1), pour les réponses partiellement justes. Par défaut : 1 si correct, 0 sinon. */
  fraction?: number;
  difficulte: NiveauDifficulte;
  /** Série en cours APRÈS cette réponse (1 pour la première bonne réponse). */
  serie: number;
  /** Secondes restantes au moment de répondre (null = pas de chrono). */
  tempsRestant: number | null;
  tempsTotal: number | null;
};

export type DetailPoints = {
  total: number;
  base: number;
  bonusRapidite: number;
  multiplicateurDifficulte: number;
  multiplicateurCombo: number;
};

/**
 * Points d'une réponse :
 * (base + bonus de rapidité) × fraction obtenue × multiplicateur de difficulté × multiplicateur de combo, arrondi.
 */
export function calculerPoints(p: CalculPoints): DetailPoints {
  const multiplicateurDifficulte = DIFFICULTES[p.difficulte].multiplicateur;
  const fraction = Math.max(0, Math.min(1, p.fraction ?? (p.correct ? 1 : 0)));
  if (fraction === 0) {
    return { total: 0, base: 0, bonusRapidite: 0, multiplicateurDifficulte, multiplicateurCombo: 1 };
  }
  const base = POINTS.base;
  let bonusRapidite = 0;
  if (p.tempsRestant !== null && p.tempsTotal !== null && p.tempsTotal > 0) {
    const ratio = Math.min(1, Math.max(0, p.tempsRestant / p.tempsTotal));
    bonusRapidite = Math.round(base * POINTS.bonusRapiditeMax * ratio);
  }
  // Le combo ne s'applique qu'aux réponses justes.
  const combo = p.correct ? multiplicateurCombo(p.serie) : 1;
  const total = Math.round((base + bonusRapidite) * fraction * multiplicateurDifficulte * combo);
  return { total, base, bonusRapidite, multiplicateurDifficulte, multiplicateurCombo: combo };
}

/** Étoiles (1 à 3) selon la précision entre 0 et 1. */
export function calculerEtoiles(precision: number): 1 | 2 | 3 {
  if (precision >= ETOILES.trois) return 3;
  if (precision >= ETOILES.deux) return 2;
  return 1;
}
