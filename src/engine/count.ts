import { type Card, type Rank, cardPoints } from './cards';

/** Valeur Hi-Lo : +1 pour 2-6, 0 pour 7-9, -1 pour 10, figures et As. */
export function hiLoValue(card: Card | Rank): -1 | 0 | 1 {
  const rank = typeof card === 'string' ? card : card.rank;
  if (rank === 'A') return -1;
  const p = cardPoints(rank);
  if (p >= 2 && p <= 6) return 1;
  if (p >= 7 && p <= 9) return 0;
  return -1;
}

export type CountClass = 'basse' | 'neutre' | 'haute';

export function countClass(card: Card | Rank): CountClass {
  const v = hiLoValue(card);
  return v === 1 ? 'basse' : v === 0 ? 'neutre' : 'haute';
}

export function runningCount(cards: readonly (Card | Rank)[], start = 0): number {
  return cards.reduce<number>((rc, c) => rc + hiLoValue(c), start);
}

export type TrueCountMethod = 'floor' | 'truncate' | 'round' | 'exact';

export const TRUE_COUNT_METHOD_LABELS: Record<TrueCountMethod, string> = {
  floor: "Arrondi à l'entier inférieur (plancher)",
  truncate: 'Troncature (vers zéro)',
  round: "Arrondi à l'entier le plus proche",
  exact: 'Valeur exacte',
};

/**
 * Convertit un running count en true count.
 *  - floor : arrondi vers -∞ (+2,7 → +2 ; -1,5 → -2) — convention de cette formation,
 *    cohérente avec les indices de déviation usuels (on « dévie » quand TC ≥ indice) ;
 *  - truncate : on supprime la partie décimale (-1,5 → -1) ;
 *  - round : arrondi au plus proche ;
 *  - exact : division brute.
 */
export function trueCount(rc: number, decksRemaining: number, method: TrueCountMethod = 'floor'): number {
  // On ne divise jamais par moins d'un demi-jeu : au-delà, l'estimation n'a plus de sens.
  const d = Math.max(decksRemaining, 0.5);
  const raw = rc / d;
  // Correction des erreurs d'arrondi binaires (ex. 3 / 0.6 = 4.999999…).
  const exact = Math.round(raw * 1e9) / 1e9;
  switch (method) {
    case 'floor':
      return Math.floor(exact) + 0; // + 0 évite -0
    case 'truncate':
      return Math.trunc(exact) + 0;
    case 'round':
      return Math.round(exact) + 0;
    case 'exact':
      return exact;
  }
}

/** Arrondit une estimation de jeux restants au demi-jeu le plus proche (minimum 0,5). */
export function roundToHalfDeck(decks: number): number {
  return Math.max(0.5, Math.round(decks * 2) / 2);
}

/**
 * Avantage approximatif du joueur (en %) : -avantage maison + 0,5 % par point de true count.
 * Règle empirique valable pour le Hi-Lo en sabot ; utile pour la gestion de la mise.
 */
export function playerEdgeAtTrueCount(tc: number, houseEdgePct: number): number {
  return Math.round((-houseEdgePct + 0.5 * tc) * 100) / 100;
}

/** Autres systèmes présentés au module 9 (valeurs par rang : A,2,3,…,9,10). */
export interface CountingSystem {
  id: string;
  name: string;
  balanced: boolean;
  level: number;
  /** Valeurs pour A, 2, 3, 4, 5, 6, 7, 8, 9, 10. */
  tags: [number, number, number, number, number, number, number, number, number, number];
  aceSideCount: boolean;
}

export const COUNTING_SYSTEMS: CountingSystem[] = [
  { id: 'hilo', name: 'Hi-Lo', balanced: true, level: 1, tags: [-1, 1, 1, 1, 1, 1, 0, 0, 0, -1], aceSideCount: false },
  { id: 'ko', name: 'KO (Knock-Out)', balanced: false, level: 1, tags: [-1, 1, 1, 1, 1, 1, 1, 0, 0, -1], aceSideCount: false },
  { id: 'omega2', name: 'Omega II', balanced: true, level: 2, tags: [0, 1, 1, 2, 2, 2, 1, 0, -1, -2], aceSideCount: true },
  { id: 'zen', name: 'Zen Count', balanced: true, level: 2, tags: [-1, 1, 1, 2, 2, 2, 1, 0, 0, -2], aceSideCount: false },
];

export function systemValue(system: CountingSystem, card: Card | Rank): number {
  const p = cardPoints(card);
  return system.tags[p === 1 ? 0 : p - 1];
}

/** Somme des valeurs d'un jeu complet : 0 pour un système équilibré. */
export function deckSum(system: CountingSystem): number {
  let s = 0;
  for (let p = 1; p <= 10; p++) s += system.tags[p - 1] * (p === 10 ? 16 : 4);
  return s;
}
