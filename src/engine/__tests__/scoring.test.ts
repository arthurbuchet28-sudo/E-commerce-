import { describe, expect, it } from 'vitest';
import { calculerEtoiles, calculerPoints, multiplicateurCombo } from '../scoring';

describe('multiplicateurCombo', () => {
  it.each([
    [0, 1],
    [2, 1],
    [3, 1.5],
    [4, 1.5],
    [5, 2],
    [9, 2],
    [10, 3],
    [25, 3],
  ])('série %i → ×%d', (serie, attendu) => {
    expect(multiplicateurCombo(serie)).toBe(attendu);
  });
});

describe('calculerPoints', () => {
  it('une mauvaise réponse rapporte 0 point', () => {
    expect(calculerPoints({ correct: false, difficulte: 'expert', serie: 0, tempsRestant: 10, tempsTotal: 10 }).total).toBe(0);
  });

  it('base sans bonus en facile quand le temps est écoulé', () => {
    expect(calculerPoints({ correct: true, difficulte: 'facile', serie: 1, tempsRestant: 0, tempsTotal: 30 }).total).toBe(100);
  });

  it('bonus de rapidité maximal (+50 %) pour une réponse instantanée', () => {
    const p = calculerPoints({ correct: true, difficulte: 'facile', serie: 1, tempsRestant: 30, tempsTotal: 30 });
    expect(p.bonusRapidite).toBe(50);
    expect(p.total).toBe(150);
  });

  it('bonus proportionnel au temps restant', () => {
    expect(calculerPoints({ correct: true, difficulte: 'facile', serie: 1, tempsRestant: 15, tempsTotal: 30 }).total).toBe(125);
  });

  it('applique le multiplicateur de difficulté', () => {
    const base = { correct: true, serie: 1, tempsRestant: 0, tempsTotal: 10 } as const;
    expect(calculerPoints({ ...base, difficulte: 'moyen' }).total).toBe(150);
    expect(calculerPoints({ ...base, difficulte: 'difficile' }).total).toBe(200);
    expect(calculerPoints({ ...base, difficulte: 'expert' }).total).toBe(300);
  });

  it('cumule difficulté et combo', () => {
    // (100 + 50) × 3 (expert) × 3 (combo ×10) = 1350
    expect(calculerPoints({ correct: true, difficulte: 'expert', serie: 10, tempsRestant: 10, tempsTotal: 10 }).total).toBe(1350);
  });

  it('pas de bonus de rapidité sans chrono', () => {
    expect(calculerPoints({ correct: true, difficulte: 'facile', serie: 1, tempsRestant: null, tempsTotal: null }).total).toBe(100);
  });

  it('borne le ratio de temps entre 0 et 1', () => {
    expect(calculerPoints({ correct: true, difficulte: 'facile', serie: 1, tempsRestant: 99, tempsTotal: 30 }).bonusRapidite).toBe(50);
    expect(calculerPoints({ correct: true, difficulte: 'facile', serie: 1, tempsRestant: -5, tempsTotal: 30 }).bonusRapidite).toBe(0);
  });
});

describe('calculerEtoiles', () => {
  it.each([
    [0, 1],
    [0.49, 1],
    [0.5, 2],
    [0.79, 2],
    [0.8, 3],
    [1, 3],
  ])('précision %d → %i étoile(s)', (precision, etoiles) => {
    expect(calculerEtoiles(precision)).toBe(etoiles);
  });
});
