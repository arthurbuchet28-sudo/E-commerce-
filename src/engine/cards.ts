import { type Rng, defaultRng, pick, shuffleInPlace } from './rng';

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const SUITS = ['♠', '♥', '♦', '♣'] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export interface Card {
  rank: Rank;
  suit: Suit;
}

/**
 * Valeur « stratégique » d'une carte : 2 à 10, et 11 pour l'As.
 * Les figures (J, Q, K) valent 10.
 */
export type UpValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const UP_VALUES: readonly UpValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Valeur de base d'une carte (As = 1, compté 11 ensuite si possible). */
export function cardPoints(card: Card | Rank): number {
  const rank = typeof card === 'string' ? card : card.rank;
  if (rank === 'A') return 1;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return Number(rank);
}

/** Valeur stratégique : As = 11, figures = 10. */
export function upValue(card: Card | Rank): UpValue {
  const rank = typeof card === 'string' ? card : card.rank;
  return (rank === 'A' ? 11 : cardPoints(rank)) as UpValue;
}

export function isTenValue(card: Card | Rank): boolean {
  return cardPoints(card) === 10;
}

export function isRed(card: Card): boolean {
  return card.suit === '♥' || card.suit === '♦';
}

export function cardLabel(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function upValueLabel(v: UpValue): string {
  return v === 11 ? 'As' : String(v);
}

/** Un jeu standard de 52 cartes, dans l'ordre. */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  return deck;
}

export function createShuffledDeck(rng: Rng = defaultRng): Card[] {
  return shuffleInPlace(createDeck(), rng);
}

/** Construit une carte de la valeur stratégique demandée, avec une couleur aléatoire. */
export function cardFromUpValue(v: UpValue, rng: Rng = defaultRng): Card {
  let rank: Rank;
  if (v === 11) rank = 'A';
  else if (v === 10) rank = pick(['10', 'J', 'Q', 'K'] as const, rng);
  else rank = String(v) as Rank;
  return { rank, suit: pick(SUITS, rng) };
}

export function randomCard(rng: Rng = defaultRng): Card {
  return { rank: pick(RANKS, rng), suit: pick(SUITS, rng) };
}
