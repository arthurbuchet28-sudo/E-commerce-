import { describe, expect, it } from 'vitest';
import type { Question } from '@/types/question';
import { creerPartie, questionSuivante, repondre, utiliserJoker, grilleEmojis } from '../partie';
import { mulberry32 } from '../random';
import {
  evaluerChronologie,
  evaluerEstimation,
  fautesTolerees,
  formaterNombre,
  levenshtein,
  reponseEnTexte,
  saisieCorrecte,
} from '../evaluation';

describe('levenshtein', () => {
  it.each([
    ['', '', 0],
    ['abc', '', 3],
    ['chat', 'chat', 0],
    ['chat', 'chats', 1],
    ['kitten', 'sitting', 3],
    ['napoleon', 'napolean', 1],
  ])('%s / %s → %i', (a, b, d) => {
    expect(levenshtein(a, b)).toBe(d);
  });
});

describe('saisie libre tolérante', () => {
  it('ignore casse, accents et articles', () => {
    expect(saisieCorrecte('la loire', ['Loire'], 'stricte')).toBe(true);
    expect(saisieCorrecte('ELYSEE', ['Élysée'], 'stricte')).toBe(true);
    expect(saisieCorrecte("l'alsace", ['Alsace'], 'stricte')).toBe(true);
  });
  it('accepte les variantes listées', () => {
    expect(saisieCorrecte('Vinci', ['Léonard de Vinci', 'Vinci', 'Leonardo da Vinci'], 'stricte')).toBe(true);
  });
  it('tolère des fautes selon la difficulté', () => {
    // « napoleon bonaparte » : 18 lettres
    expect(fautesTolerees(18, 'large')).toBe(6);
    expect(fautesTolerees(18, 'moyenne')).toBe(4);
    expect(fautesTolerees(18, 'faible')).toBe(2);
    expect(fautesTolerees(18, 'stricte')).toBe(0);
    expect(saisieCorrecte('napolean bonapart', ['Napoléon Bonaparte'], 'faible')).toBe(true);
    expect(saisieCorrecte('napolean bonapart', ['Napoléon Bonaparte'], 'stricte')).toBe(false);
  });
  it('refuse une réponse trop éloignée', () => {
    expect(saisieCorrecte('Marseille', ['Paris'], 'large')).toBe(false);
    expect(saisieCorrecte('', ['Paris'], 'large')).toBe(false);
  });
  it('les nombres doivent être exacts', () => {
    expect(saisieCorrecte('1789', ['1789'], 'large')).toBe(true);
    expect(saisieCorrecte('1788', ['1789'], 'large')).toBe(false);
  });
});

describe('estimation', () => {
  it('100 % si exact, dégressif ensuite, 0 au-delà de la marge', () => {
    expect(evaluerEstimation(1789, 1789, 20)).toMatchObject({ fraction: 1, correct: true, ecart: 0 });
    expect(evaluerEstimation(1799, 1789, 20)).toMatchObject({ fraction: 0.5, correct: true, ecart: 10 });
    expect(evaluerEstimation(1804, 1789, 20).correct).toBe(false);
    expect(evaluerEstimation(1700, 1789, 20).fraction).toBe(0);
  });
});

describe('chronologie', () => {
  const bon = ['A', 'B', 'C', 'D'];
  it('juste seulement si tout est dans l’ordre', () => {
    expect(evaluerChronologie(['A', 'B', 'C', 'D'], bon)).toEqual({ correct: true, fraction: 1 });
    expect(evaluerChronologie(['A', 'B', 'D', 'C'], bon)).toEqual({ correct: false, fraction: 0.5 });
    expect(evaluerChronologie(['D', 'C', 'B', 'A'], bon)).toEqual({ correct: false, fraction: 0 });
  });
});

describe('affichage', () => {
  it('années sans séparateur, grands nombres à la française', () => {
    expect(formaterNombre(1789)).toBe('1789');
    expect(formaterNombre(67000000).replace(/\s/g, ' ')).toBe('67 000 000');
    expect(reponseEnTexte(['A', 'B'])).toBe('A → B');
    expect(reponseEnTexte(null)).toBeNull();
  });
});

function q(extra: Partial<Question>): Question {
  return { id: 'x', source: 'test', categorie: 'histoire', type: 'qcm', difficulte: 2, enonce: 'Test ?', bonneReponse: 'A', ...extra };
}

describe('partie avec les nouveaux modes', () => {
  const config = { mode: 'classique' as const, categorie: 'histoire' as const, difficulte: 'difficile' as const, nombreQuestions: 3 };
  const questions = [
    q({ id: 's', type: 'saisie', bonneReponse: 'Napoléon', reponsesAcceptees: ['Bonaparte'] }),
    q({ id: 'e', type: 'estimation', bonneReponse: 1789, estimation: { marge: 20 } }),
    q({ id: 'c', type: 'chronologie', bonneReponse: ['A', 'B', 'C', 'D'] }),
  ];

  it('prépare le bon mode et ne présente pas la chronologie déjà rangée', () => {
    const p = creerPartie(config, questions, mulberry32(1));
    expect(p.questions.map((x) => x.mode)).toEqual(['saisie', 'estimation', 'chronologie']);
    expect(p.questions[2]!.choix).not.toEqual(['A', 'B', 'C', 'D']);
    expect([...p.questions[2]!.choix].sort()).toEqual(['A', 'B', 'C', 'D']);
  });

  it('donne plus de temps pour la saisie et la chronologie', () => {
    let p = creerPartie(config, questions, mulberry32(1));
    // difficile : 15 s ; saisie ×1,5 ; estimation ×1,3 ; chronologie ×2
    expect(p.questions[0]!.mode).toBe('saisie');
    p = repondre(p, 'bonaparte', 1);
    expect(p.resultats[0]!.correct).toBe(true);
    p = questionSuivante(p);
    p = repondre(p, 1799, 1); // marge 20 × 1 (difficile) → 50 %
    expect(p.resultats[1]).toMatchObject({ correct: true, fraction: 0.5, reponse: '1799' });
    p = questionSuivante(p);
    p = repondre(p, ['A', 'B', 'D', 'C'], 1);
    expect(p.resultats[2]).toMatchObject({ correct: false, fraction: 0.5 });
    expect(p.resultats[2]!.points.total).toBeGreaterThan(0);
    expect(p.serie).toBe(0);
    expect(grilleEmojis(p.resultats)).toBe('🟩🟩🟨');
  });

  it('50/50 ne s’applique pas hors QCM, l’indice s’adapte au mode', () => {
    const rng = mulberry32(2);
    let p = creerPartie(config, questions, rng);
    expect(utiliserJoker(p, 'cinquante', rng)).toBe(p);
    p = utiliserJoker(p, 'indice', rng);
    expect(p.indice).toBe('Commence par « N »');
    p = questionSuivante(repondre(p, 'x', 1));
    // Indice déjà utilisé : aucun effet.
    expect(utiliserJoker(p, 'indice', rng)).toBe(p);
  });

  it('en Expert, un QCM avec réponses acceptées peut passer en saisie', () => {
    const qcm = q({ id: 'q', choix: ['A', 'B', 'C', 'D', 'E', 'F'], reponsesAcceptees: ['A'] });
    const modes = new Set(
      Array.from({ length: 30 }, (_, i) => creerPartie({ ...config, difficulte: 'expert' }, [qcm], mulberry32(i)).questions[0]!.mode),
    );
    expect(modes).toEqual(new Set(['choix', 'saisie']));
    expect(creerPartie({ ...config, difficulte: 'moyen' }, [qcm], mulberry32(1)).questions[0]!.mode).toBe('choix');
  });
});
