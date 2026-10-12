import { type Card, cardPoints, isTenValue } from './cards';

export interface HandValue {
  /** Meilleur total (≤ 21 si possible). */
  total: number;
  /** Vrai si un As est compté 11 dans ce total (main « soft »). */
  soft: boolean;
}

/**
 * Calcule la valeur d'une main.
 * On compte tous les As pour 1, puis on en passe UN à 11 si cela ne fait pas dépasser 21
 * (deux As à 11 feraient 22 : il n'y a donc jamais plus d'un As « soft »).
 */
export function handValue(cards: readonly Card[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardPoints(c);
    if (c.rank === 'A') aces++;
  }
  if (aces > 0 && total + 10 <= 21) return { total: total + 10, soft: true };
  return { total, soft: false };
}

/** Blackjack naturel : As + carte de valeur 10 en deux cartes (hors main issue d'un split). */
export function isBlackjack(cards: readonly Card[]): boolean {
  if (cards.length !== 2) return false;
  const [a, b] = cards;
  return (a.rank === 'A' && isTenValue(b)) || (b.rank === 'A' && isTenValue(a));
}

export function isBust(cards: readonly Card[]): boolean {
  return handValue(cards).total > 21;
}

/** Paire séparable : deux cartes de même valeur (un 10 et un Roi forment une paire de 10). */
export function isPair(cards: readonly Card[]): boolean {
  return cards.length === 2 && cardPoints(cards[0]) === cardPoints(cards[1]);
}

export function describeHand(cards: readonly Card[]): string {
  const v = handValue(cards);
  if (isBlackjack(cards)) return 'Blackjack';
  if (v.total > 21) return `${v.total} (sauté)`;
  return v.soft ? `${v.total - 10}/${v.total} (soft)` : String(v.total);
}
