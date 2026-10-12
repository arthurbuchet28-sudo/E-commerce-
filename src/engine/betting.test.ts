import { describe, expect, it } from 'vitest';
import {
  bankrollForRisk,
  betForTc,
  defaultRamp,
  evaluateRamp,
  normalCdf,
  probabilityOfLoss,
  rampSpread,
  riskOfRuin,
  simulateTrueCountFrequencies,
} from './betting';
import { mulberry32 } from './rng';
import { houseEdge, REFERENCE_RULES } from './rules';

describe('gestion de la mise', () => {
  it('rampe par défaut 1-8', () => {
    const r = defaultRamp(8);
    expect(betForTc(r, -2)).toBe(1);
    expect(betForTc(r, 1)).toBe(1);
    expect(betForTc(r, 2)).toBe(2);
    expect(betForTc(r, 3)).toBe(4);
    expect(betForTc(r, 4)).toBe(6);
    expect(betForTc(r, 5)).toBe(8);
    expect(betForTc(r, 10)).toBe(8);
    expect(rampSpread(r)).toBe(8);
  });

  it('les fréquences de true count somment à 1 et le TC ≤ 0 domine', () => {
    const f = simulateTrueCountFrequencies(REFERENCE_RULES, 1, 150, mulberry32(4));
    const sum = Object.values(f).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
    const negOrZero = f[-3] + f[-2] + f[-1] + f[0];
    expect(negOrZero).toBeGreaterThan(0.5);
  });

  it('mise à plat = espérance négative, rampe 1-8 = espérance positive', () => {
    const f = simulateTrueCountFrequencies(REFERENCE_RULES, 1, 300, mulberry32(8));
    const flat: Record<number, number> = {};
    for (let tc = -3; tc <= 6; tc++) flat[tc] = 1;
    expect(evaluateRamp(flat, f, houseEdge(REFERENCE_RULES)).evPerRound).toBeLessThan(0);
    const spread = evaluateRamp(defaultRamp(12), f, houseEdge(REFERENCE_RULES));
    expect(spread.evPerRound).toBeGreaterThan(0);
    expect(spread.n0).toBeGreaterThan(1000);
  });

  it('wonging : ne pas jouer les comptes négatifs améliore l’avantage', () => {
    const f = simulateTrueCountFrequencies(REFERENCE_RULES, 1, 300, mulberry32(8));
    const ramp = defaultRamp(8);
    const wong = { ...ramp, [-3]: 0, [-2]: 0, [-1]: 0 };
    const a = evaluateRamp(ramp, f, 0.34);
    const b = evaluateRamp(wong, f, 0.34);
    expect(b.edgePct).toBeGreaterThan(a.edgePct);
    expect(b.playedFraction).toBeLessThan(1);
  });

  it('risque de ruine', () => {
    expect(riskOfRuin(-0.01, 1.15, 1000)).toBe(1);
    const ror = riskOfRuin(0.02, 3, 400);
    expect(ror).toBeCloseTo(Math.exp((-2 * 0.02 * 400) / 9), 10);
    const b = bankrollForRisk(0.02, 3, 0.05);
    expect(riskOfRuin(0.02, 3, b)).toBeCloseTo(0.05, 10);
  });

  it('loi normale et probabilité de perte', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    // Avec un avantage faible, on est souvent en perte après 1 000 mains.
    expect(probabilityOfLoss(0.01, 1.15, 1000)).toBeGreaterThan(0.3);
  });
});

describe('avantage de la maison', () => {
  it('configuration de référence ≈ 0,34 %', () => {
    expect(houseEdge(REFERENCE_RULES)).toBeCloseTo(0.34, 2);
  });
  it('le 6:5 coûte environ 1,4 %', () => {
    expect(houseEdge({ ...REFERENCE_RULES, blackjackPayout: 1.2 }) - houseEdge(REFERENCE_RULES)).toBeCloseTo(1.39, 2);
  });
  it('H17 et moins de jeux', () => {
    expect(houseEdge({ ...REFERENCE_RULES, dealerHitsSoft17: true })).toBeGreaterThan(houseEdge(REFERENCE_RULES));
    expect(houseEdge({ ...REFERENCE_RULES, decks: 2 })).toBeLessThan(houseEdge(REFERENCE_RULES));
  });
  it('la pénétration ne change pas l’avantage de la maison', () => {
    expect(houseEdge({ ...REFERENCE_RULES, penetration: 0.5 })).toBe(houseEdge(REFERENCE_RULES));
  });
});
