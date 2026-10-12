import { describe, expect, it } from 'vitest';
import { banqueFichiers } from '@/providers/local';
import { classerSalon, codeDepuisAncre, genererCode, lienSalon, normaliserCode, questionsDuSalon } from '../salon';
import { creerPartie, type ConfigPartie } from '../partie';
import { rngDuSalon } from '../salon';
import { rngDepuisChaine } from '../random';

const config = (graine: string, extra: Partial<ConfigPartie> = {}): ConfigPartie => ({
  mode: 'multi',
  categorie: 'mix',
  difficulte: 'moyen',
  nombreQuestions: 10,
  salon: graine,
  ...extra,
});

describe('salon entre amis', () => {
  it('génère des codes valides et normalise la saisie', () => {
    const rng = rngDepuisChaine('codes');
    for (let i = 0; i < 50; i++) expect(normaliserCode(genererCode(rng))).not.toBeNull();
    expect(normaliserCode(' k7 qf ')).toBe('K7QF');
    expect(normaliserCode('K0QF')).toBeNull(); // 0 exclu (confusion avec O)
    expect(normaliserCode('ABC')).toBeNull();
  });

  it('construit et relit le lien d’invitation', () => {
    const lien = lienSalon('K7QF', 'https://exemple.fr/quiz/#/accueil');
    expect(lien).toBe('https://exemple.fr/quiz/#salon-K7QF');
    expect(codeDepuisAncre('#salon-K7QF')).toBe('K7QF');
    expect(codeDepuisAncre('#/salon/k7qf')).toBe('K7QF');
    expect(codeDepuisAncre('#/profil')).toBeNull();
  });

  it('donne les mêmes questions et les mêmes choix à tous les joueurs d’une manche', () => {
    const a = creerPartie(config('abc'), questionsDuSalon(banqueFichiers(), config('abc')), rngDuSalon('abc'));
    const b = creerPartie(config('abc'), questionsDuSalon([...banqueFichiers()].reverse(), config('abc')), rngDuSalon('abc'));
    expect(a.questions).toHaveLength(10);
    expect(a.questions.map((q) => [q.question.id, q.choix])).toEqual(b.questions.map((q) => [q.question.id, q.choix]));
    const c = questionsDuSalon(banqueFichiers(), config('autre'));
    expect(c.map((q) => q.id)).not.toEqual(a.questions.map((q) => q.question.id));
    expect(a.questions.every((q) => !q.question.media)).toBe(true);
  });

  it('respecte le thème choisi', () => {
    const qs = questionsDuSalon(banqueFichiers(), config('x', { categorie: 'geographie', nombreQuestions: 5 }));
    expect(qs).toHaveLength(5);
    expect(qs.every((q) => q.categorie === 'geographie')).toBe(true);
  });

  it('classe les joueurs, ex æquo au même rang', () => {
    const c = classerSalon([
      { id: 'a', pseudo: 'Alice', score: 500, bonnes: 4 },
      { id: 'b', pseudo: 'Bob', score: 900, bonnes: 6 },
      { id: 'c', pseudo: 'Chloé', score: 500, bonnes: 4 },
      { id: 'd', pseudo: 'Dan', score: 500, bonnes: 3 },
    ]);
    expect(c.map((j) => [j.pseudo, j.rang])).toEqual([
      ['Bob', 1],
      ['Alice', 2],
      ['Chloé', 2],
      ['Dan', 4],
    ]);
  });
});
