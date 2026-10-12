import { describe, expect, it } from 'vitest';
import { hacherChaine, melanger, mulberry32, rngDepuisChaine } from '../random';
import { normaliserTexte, sansAccents } from '../texte';

describe('normaliserTexte', () => {
  it('ignore casse, accents et ponctuation', () => {
    expect(normaliserTexte('  Élysée, Œuvre !  ')).toBe('elysee oeuvre');
  });
  it('retire les articles en tête', () => {
    expect(normaliserTexte('La Loire')).toBe('loire');
    expect(normaliserTexte("L'Alsace")).toBe('alsace');
    expect(normaliserTexte('Les Incas')).toBe('incas');
    expect(normaliserTexte('De la farine')).toBe('farine');
  });
  it('ne retire pas un article au milieu', () => {
    expect(normaliserTexte('Tour de France')).toBe('tour de france');
  });
  it('sansAccents gère les ligatures', () => {
    expect(sansAccents('cœur æther ça')).toBe('coeur aether ca');
  });
});

describe('générateur aléatoire', () => {
  it('même graine = même suite', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('graines différentes = suites différentes', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
  it('produit des valeurs dans [0, 1)', () => {
    const r = rngDepuisChaine('2026-10-12');
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('le hachage est stable', () => {
    expect(hacherChaine('quizmania')).toBe(hacherChaine('quizmania'));
  });
  it('melanger est déterministe, conserve les éléments et ne modifie pas la source', () => {
    const source = [1, 2, 3, 4, 5, 6, 7, 8];
    const m1 = melanger(source, mulberry32(7));
    const m2 = melanger(source, mulberry32(7));
    expect(m1).toEqual(m2);
    expect([...m1].sort()).toEqual(source);
    expect(source).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
