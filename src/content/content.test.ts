import { describe, expect, it } from 'vitest';
import { MODULES } from './index';

describe('contenu des modules', () => {
  it('9 modules numérotés dans l’ordre', () => {
    expect(MODULES.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  for (const m of MODULES) {
    it(`module ${m.id} : structure complète et quiz valide`, () => {
      expect(m.objectives.length).toBeGreaterThan(0);
      expect(m.sections.length).toBeGreaterThan(0);
      expect(m.keyPoints.length).toBeGreaterThan(0);
      expect(m.mistakes.length).toBeGreaterThan(0);
      expect(m.exercises.length).toBeGreaterThan(0);
      expect(m.quiz.length).toBeGreaterThanOrEqual(10);
      for (const q of m.quiz) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.choices.length);
        expect(q.explanation.length).toBeGreaterThan(10);
        expect(new Set(q.choices).size).toBe(q.choices.length);
      }
    });
  }
});
