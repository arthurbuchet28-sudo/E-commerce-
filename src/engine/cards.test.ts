import { describe, expect, it } from 'vitest';
import { createDeck, cardPoints, upValue, cardFromUpValue, UP_VALUES } from './cards';
import { handValue, isBlackjack, isPair } from './hand';
import { mulberry32, shuffleInPlace } from './rng';

const c = (rank: string, suit = '♠') => ({ rank, suit }) as never;

describe('cartes', () => {
  it('un jeu contient 52 cartes uniques', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((x) => x.rank + x.suit)).size).toBe(52);
  });

  it('valeurs des cartes', () => {
    expect(cardPoints('A')).toBe(1);
    expect(cardPoints('7')).toBe(7);
    expect(cardPoints('K')).toBe(10);
    expect(upValue('A')).toBe(11);
    expect(upValue('Q')).toBe(10);
  });

  it('cardFromUpValue respecte la valeur', () => {
    const rng = mulberry32(1);
    for (const v of UP_VALUES) expect(upValue(cardFromUpValue(v, rng))).toBe(v);
  });

  it('le mélange est une permutation reproductible', () => {
    const a = shuffleInPlace(createDeck(), mulberry32(42));
    const b = shuffleInPlace(createDeck(), mulberry32(42));
    expect(a).toEqual(b);
    expect(a).not.toEqual(createDeck());
    expect(a).toHaveLength(52);
  });
});

describe('valeur des mains', () => {
  it('main dure', () => {
    expect(handValue([c('10'), c('6')])).toEqual({ total: 16, soft: false });
  });
  it('main soft', () => {
    expect(handValue([c('A'), c('6')])).toEqual({ total: 17, soft: true });
  });
  it("l'As repasse à 1 quand il le faut", () => {
    expect(handValue([c('A'), c('6'), c('9')])).toEqual({ total: 16, soft: false });
  });
  it('deux As = soft 12', () => {
    expect(handValue([c('A'), c('A')])).toEqual({ total: 12, soft: true });
  });
  it('quatre As + 7 = soft 21', () => {
    expect(handValue([c('A'), c('A'), c('A'), c('A'), c('7')])).toEqual({ total: 21, soft: true });
  });
  it('blackjack', () => {
    expect(isBlackjack([c('A'), c('K')])).toBe(true);
    expect(isBlackjack([c('10'), c('A')])).toBe(true);
    expect(isBlackjack([c('A'), c('5'), c('5')])).toBe(false);
  });
  it('paires : 10 et Roi forment une paire', () => {
    expect(isPair([c('10'), c('K')])).toBe(true);
    expect(isPair([c('9'), c('8')])).toBe(false);
  });
});
