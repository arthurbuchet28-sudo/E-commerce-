import { describe, expect, it } from 'vitest';
import { Shoe } from './shoe';
import { mulberry32 } from './rng';
import { hiLoValue } from './count';

describe('sabot', () => {
  it('contient 52 × N cartes avec 4N exemplaires de chaque rang', () => {
    const shoe = new Shoe(6, 0.75, mulberry32(3));
    const ranks: Record<string, number> = {};
    for (let i = 0; i < 312; i++) {
      const card = shoe.draw();
      ranks[card.rank] = (ranks[card.rank] ?? 0) + 1;
    }
    expect(Object.values(ranks).every((n) => n === 24)).toBe(true);
  });

  it('un sabot complet a un running count final de 0 (système équilibré)', () => {
    const shoe = new Shoe(8, 1, mulberry32(9));
    let rc = 0;
    for (let i = 0; i < 8 * 52; i++) rc += hiLoValue(shoe.draw());
    expect(rc).toBe(0);
    expect(shoe.runningCount).toBe(0);
  });

  it('suit les cartes restantes et la pénétration', () => {
    const shoe = new Shoe(6, 0.75, mulberry32(1));
    expect(shoe.cutCardPosition).toBe(234);
    for (let i = 0; i < 233; i++) shoe.draw();
    expect(shoe.needsShuffle).toBe(false);
    shoe.draw();
    expect(shoe.needsShuffle).toBe(true);
    expect(shoe.cardsRemaining).toBe(78);
    expect(shoe.decksRemaining).toBeCloseTo(1.5);
    expect(shoe.decksDiscarded).toBeCloseTo(4.5);
    shoe.shuffle();
    expect(shoe.cardsRemaining).toBe(312);
  });

  it('rejette des paramètres invalides', () => {
    expect(() => new Shoe(0)).toThrow();
    expect(() => new Shoe(6, 1.2)).toThrow();
  });
});
