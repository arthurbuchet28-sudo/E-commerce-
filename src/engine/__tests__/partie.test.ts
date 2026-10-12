import { describe, expect, it } from 'vitest';
import type { Question } from '@/types/question';
import { creerPartie, grilleEmojis, questionSuivante, repondre, resumerPartie, utiliserJoker, type ConfigPartie } from '../partie';
import { cinquanteCinquante, indicePremiereLettre, preparerChoix } from '../qcm';
import { mulberry32 } from '../random';
import { dedoublonner, selectionnerQuestions } from '../selection';

function q(id: string, extra: Partial<Question> = {}): Question {
  return {
    id,
    source: 'test',
    categorie: 'sport',
    type: 'qcm',
    difficulte: 1,
    enonce: `Question ${id} ?`,
    choix: ['A', 'B', 'C', 'D', 'E', 'F'],
    bonneReponse: 'A',
    ...extra,
  };
}

const config: ConfigPartie = { mode: 'classique', categorie: 'sport', difficulte: 'facile', nombreQuestions: 3 };

describe('preparerChoix', () => {
  it('garde la bonne réponse et le bon nombre de choix', () => {
    const rng = mulberry32(1);
    for (const n of [3, 4, 6]) {
      const choix = preparerChoix(q('1'), n, rng);
      expect(choix).toHaveLength(n);
      expect(choix).toContain('A');
      expect(new Set(choix).size).toBe(n);
    }
  });
  it('Vrai / Faux reste dans l’ordre', () => {
    expect(preparerChoix(q('1', { type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonneReponse: 'Faux' }), 6, mulberry32(1))).toEqual(['Vrai', 'Faux']);
  });
  it('se contente des choix disponibles', () => {
    expect(preparerChoix(q('1', { choix: ['A', 'B', 'C'] }), 6, mulberry32(1))).toHaveLength(3);
  });
});

describe('jokers', () => {
  it('50/50 masque la moitié des mauvaises réponses, jamais la bonne', () => {
    const masques = cinquanteCinquante(['A', 'B', 'C', 'D'], 'A', mulberry32(3));
    expect(masques).toHaveLength(2);
    expect(masques).not.toContain('A');
  });
  it('indice : première lettre et nombre de mots', () => {
    expect(indicePremiereLettre('le mont Blanc')).toBe('Commence par « L » (3 mots)');
    expect(indicePremiereLettre('Mars')).toBe('Commence par « M »');
  });
  it('chaque joker ne sert qu’une fois et le stock diminue', () => {
    const rng = mulberry32(1);
    let p = creerPartie(config, [q('1'), q('2')], rng);
    expect(p.jokersRestants).toBe(3);
    p = utiliserJoker(p, 'temps', rng);
    expect(p.tempsBonus).toBe(10);
    expect(p.jokersRestants).toBe(2);
    const encore = utiliserJoker(p, 'temps', rng);
    expect(encore).toBe(p);
  });
  it('passer conserve la série et ne compte pas dans la précision', () => {
    const rng = mulberry32(1);
    let p = creerPartie(config, [q('1'), q('2'), q('3')], rng);
    p = questionSuivante(repondre(p, 'A', 1));
    p = questionSuivante(utiliserJoker(p, 'passer', rng));
    expect(p.serie).toBe(1);
    p = questionSuivante(repondre(p, 'A', 1));
    expect(p.serie).toBe(2);
    expect(p.phase).toBe('terminee');
    const r = resumerPartie(p);
    expect(r.repondues).toBe(2);
    expect(r.precision).toBe(1);
    expect(grilleEmojis(p.resultats)).toBe('🟩⬜🟩');
  });
  it('aucun joker en expert', () => {
    const p = creerPartie({ ...config, difficulte: 'expert' }, [q('1')], mulberry32(1));
    expect(p.jokersRestants).toBe(0);
    expect(utiliserJoker(p, 'cinquante', mulberry32(1))).toBe(p);
  });
});

describe('déroulé d’une partie', () => {
  it('compte score, série et meilleure série', () => {
    const rng = mulberry32(5);
    let p = creerPartie(config, [q('1'), q('2'), q('3')], rng);
    p = questionSuivante(repondre(p, 'A', 0)); // 150
    p = questionSuivante(repondre(p, 'A', 30)); // 100
    expect(p.serie).toBe(2);
    p = repondre(p, 'B', 3);
    expect(p.serie).toBe(0);
    expect(p.meilleureSerie).toBe(2);
    expect(p.score).toBe(250);
    p = questionSuivante(p);
    expect(p.phase).toBe('terminee');
    const r = resumerPartie(p);
    expect(r.bonnes).toBe(2);
    expect(r.etoiles).toBe(2);
  });
  it('temps écoulé = réponse fausse', () => {
    let p = creerPartie(config, [q('1')], mulberry32(1));
    p = repondre(p, null, 30);
    expect(p.resultats[0]).toMatchObject({ correct: false, reponse: null, passee: false });
  });
  it('ignore une deuxième réponse à la même question', () => {
    let p = creerPartie(config, [q('1'), q('2')], mulberry32(1));
    p = repondre(p, 'B', 1);
    expect(repondre(p, 'A', 2)).toBe(p);
  });
});

describe('sélection des questions', () => {
  const banque = [
    q('a', { difficulte: 1 }),
    q('b', { difficulte: 1 }),
    q('c', { difficulte: 2 }),
    q('d', { difficulte: 4 }),
    q('e', { difficulte: 1, categorie: 'histoire' }),
  ];
  it('filtre par catégorie et privilégie le bon niveau', () => {
    const s = selectionnerQuestions(banque, { categorie: 'sport', niveaux: [1], nombre: 2, rng: mulberry32(1) });
    expect(s.map((x) => x.id).sort()).toEqual(['a', 'b']);
  });
  it('complète avec les niveaux voisins si la banque est trop petite', () => {
    const s = selectionnerQuestions(banque, { categorie: 'sport', niveaux: [1], nombre: 3, rng: mulberry32(1) });
    expect(s.map((x) => x.id).sort()).toEqual(['a', 'b', 'c']);
  });
  it('évite les questions vues récemment', () => {
    const s = selectionnerQuestions(banque, { categorie: 'sport', niveaux: [1], nombre: 2, rng: mulberry32(1), vuesRecemment: new Set(['a']) });
    expect(s.map((x) => x.id)).not.toContain('a');
  });
  it('le mix pioche dans toutes les catégories', () => {
    const s = selectionnerQuestions(banque, { categorie: 'mix', niveaux: [1], nombre: 5, rng: mulberry32(1) });
    expect(s).toHaveLength(5);
  });
  it('dédoublonne sur l’énoncé normalisé', () => {
    expect(dedoublonner([q('x', { enonce: 'La capitale ?' }), q('y', { enonce: 'capitale' })])).toHaveLength(1);
  });
});
