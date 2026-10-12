import { describe, expect, it } from 'vitest';
import { hiLoValue, runningCount, trueCount, roundToHalfDeck, playerEdgeAtTrueCount, COUNTING_SYSTEMS, deckSum } from './count';
import { createDeck } from './cards';

describe('Hi-Lo', () => {
  it('valeurs des cartes', () => {
    for (const r of ['2', '3', '4', '5', '6'] as const) expect(hiLoValue(r)).toBe(1);
    for (const r of ['7', '8', '9'] as const) expect(hiLoValue(r)).toBe(0);
    for (const r of ['10', 'J', 'Q', 'K', 'A'] as const) expect(hiLoValue(r)).toBe(-1);
  });

  it('un jeu complet totalise 0', () => {
    expect(runningCount(createDeck())).toBe(0);
  });

  it('running count d’une séquence', () => {
    expect(runningCount(['2', '5', 'K', '7', 'A', '3', '4'])).toBe(2);
  });
});

describe('true count', () => {
  it('division simple', () => {
    expect(trueCount(6, 3)).toBe(2);
    expect(trueCount(6, 2, 'exact')).toBe(3);
  });
  it('arrondi plancher vs troncature sur les comptes négatifs', () => {
    expect(trueCount(-3, 2, 'floor')).toBe(-2);
    expect(trueCount(-3, 2, 'truncate')).toBe(-1);
    expect(trueCount(-3, 2, 'round')).toBe(-1); // Math.round(-1.5) = -1
  });
  it('arrondi plancher sur les comptes positifs', () => {
    expect(trueCount(11, 4, 'floor')).toBe(2);
    expect(trueCount(11, 4, 'round')).toBe(3);
  });
  it('pas d’erreur binaire (3 / 0,6 = 5)', () => {
    expect(trueCount(3, 0.6)).toBe(5);
  });
  it('on ne divise pas par moins d’un demi-jeu', () => {
    expect(trueCount(4, 0.1, 'exact')).toBe(8);
  });
  it('pas de -0', () => {
    expect(Object.is(trueCount(-1, 4, 'truncate'), 0)).toBe(true);
  });
  it('arrondi au demi-jeu', () => {
    expect(roundToHalfDeck(2.3)).toBe(2.5);
    expect(roundToHalfDeck(2.2)).toBe(2);
    expect(roundToHalfDeck(0.1)).toBe(0.5);
  });
  it('avantage du joueur ≈ -avantage maison + 0,5 % par point', () => {
    expect(playerEdgeAtTrueCount(0, 0.5)).toBe(-0.5);
    expect(playerEdgeAtTrueCount(3, 0.5)).toBe(1);
  });
});

describe('autres systèmes', () => {
  it('les systèmes équilibrés totalisent 0, le KO +4 par jeu', () => {
    for (const s of COUNTING_SYSTEMS) {
      if (s.balanced) expect(deckSum(s)).toBe(0);
      else expect(deckSum(s)).toBe(4);
    }
  });
});
