import { describe, expect, it } from 'vitest';
import type { NiveauQuestion, Question } from '@/types/question';
import { banqueLocale } from '@/providers/local';
import { cleJour, questionsDuDefi, serieDeJours } from '../defi';
import {
  ajusterAdaptatif,
  creerPartie,
  niveauSurvie,
  questionSuivante,
  repondre,
  resumerPartie,
  tempsQuestion,
  terminer,
  utiliserJoker,
  type ConfigPartie,
  type EtatPartie,
} from '../partie';
import { mulberry32 } from '../random';

function q(id: string, difficulte: NiveauQuestion = 1): Question {
  return { id, source: 'test', categorie: 'sport', type: 'qcm', difficulte, enonce: `Question ${id} ?`, choix: ['A', 'B', 'C', 'D', 'E', 'F'], bonneReponse: 'A' };
}
const stock = (n: number) => Array.from({ length: n }, (_, i) => q(`q${i}`, ((i % 4) + 1) as NiveauQuestion));
const base: ConfigPartie = { mode: 'classique', categorie: 'sport', difficulte: 'moyen', nombreQuestions: 5 };

/** Joue la partie jusqu'au bout : `juste(i)` dit si la i-ème réponse est bonne. */
function jouer(p: EtatPartie, juste: (i: number) => boolean, max = 200): EtatPartie {
  const rng = mulberry32(9);
  for (let i = 0; i < max && p.phase !== 'terminee'; i++) {
    p = repondre(p, juste(i) ? 'A' : 'B', 1);
    p = questionSuivante(p, rng);
  }
  return p;
}

describe('mode adaptatif', () => {
  it('monte après 3 bonnes réponses d’affilée, baisse après 2 erreurs', () => {
    let r = ajusterAdaptatif('moyen', { bonnes: 0, erreurs: 0 }, true);
    r = ajusterAdaptatif(r.niveau, r.compteurs, true);
    expect(r.niveau).toBe('moyen');
    r = ajusterAdaptatif(r.niveau, r.compteurs, true);
    expect(r).toMatchObject({ niveau: 'difficile', changement: 'hausse' });
    r = ajusterAdaptatif(r.niveau, r.compteurs, false);
    expect(r.niveau).toBe('difficile');
    r = ajusterAdaptatif(r.niveau, r.compteurs, false);
    expect(r).toMatchObject({ niveau: 'moyen', changement: 'baisse' });
  });
  it('une bonne réponse remet le compteur d’erreurs à zéro', () => {
    let r = ajusterAdaptatif('moyen', { bonnes: 0, erreurs: 0 }, false);
    r = ajusterAdaptatif(r.niveau, r.compteurs, true);
    r = ajusterAdaptatif(r.niveau, r.compteurs, false);
    expect(r.niveau).toBe('moyen');
  });
  it('reste borné entre facile et expert', () => {
    expect(ajusterAdaptatif('expert', { bonnes: 2, erreurs: 0 }, true).niveau).toBe('expert');
    expect(ajusterAdaptatif('facile', { bonnes: 0, erreurs: 1 }, false).niveau).toBe('facile');
  });
  it('en partie : la question suivante suit le niveau atteint', () => {
    let p = creerPartie({ ...base, difficulte: 'adaptatif', nombreQuestions: 6 }, stock(60), mulberry32(1));
    expect(p.niveau).toBe('moyen');
    p = jouer(p, () => true);
    expect(p.phase).toBe('terminee');
    expect(p.questions).toHaveLength(6);
    // 6 bonnes réponses : moyen → difficile → expert ; les dernières questions sont de niveau 3-4.
    expect(p.niveau).toBe('expert');
    expect(p.questions.at(-1)!.question.difficulte).toBeGreaterThanOrEqual(3);
    expect(p.resultats.filter((r) => r.changementNiveau === 'hausse')).toHaveLength(2);
  });
});

describe('mode survie', () => {
  const survie: ConfigPartie = { ...base, mode: 'survie', difficulte: 'facile' };
  it('3 vies : la partie s’arrête à la troisième erreur', () => {
    const p = jouer(creerPartie(survie, stock(100), mulberry32(2)), (i) => i % 3 !== 2);
    expect(p.phase).toBe('terminee');
    expect(p.vies).toBe(0);
    expect(p.resultats.filter((r) => !r.correct)).toHaveLength(3);
    expect(p.resultats).toHaveLength(9);
  });
  it('la difficulté monte toutes les 5 questions', () => {
    expect([0, 4, 5, 10, 15, 40].map((n) => niveauSurvie('facile', n))).toEqual(['facile', 'facile', 'moyen', 'difficile', 'expert', 'expert']);
  });
  it('passer une question ne coûte pas de vie', () => {
    let p = creerPartie(survie, stock(20), mulberry32(3));
    p = utiliserJoker(p, 'passer', mulberry32(3));
    expect(p.vies).toBe(3);
  });
  it('s’arrête si le stock est épuisé', () => {
    const p = jouer(creerPartie(survie, stock(4), mulberry32(4)), () => true);
    expect(p.phase).toBe('terminee');
    expect(p.resultats).toHaveLength(4);
  });
});

describe('contre-la-montre', () => {
  const chrono: ConfigPartie = { ...base, mode: 'contre_la_montre' };
  it('pas de chrono par question ni de joker de temps', () => {
    const p = creerPartie(chrono, stock(30), mulberry32(5));
    expect(tempsQuestion(p)).toBeNull();
    expect(utiliserJoker(p, 'temps', mulberry32(5))).toBe(p);
  });
  it('le temps écoulé termine la partie sans compter la question en cours', () => {
    let p = creerPartie(chrono, stock(30), mulberry32(5));
    p = questionSuivante(repondre(p, 'A', 1), mulberry32(5));
    p = questionSuivante(repondre(p, 'A', 1), mulberry32(5));
    expect(p.phase).toBe('question');
    p = terminer(p);
    expect(p.phase).toBe('terminee');
    expect(p.questions).toHaveLength(2);
    expect(resumerPartie(p).bonnes).toBe(2);
  });
});

describe('entraînement et blind test', () => {
  it('entraînement : ni chrono, ni points, ni jokers', () => {
    let p = creerPartie({ ...base, mode: 'entrainement' }, [q('a'), q('b')], mulberry32(6));
    expect(tempsQuestion(p)).toBeNull();
    expect(p.jokersRestants).toBe(0);
    p = repondre(p, 'A', 3);
    expect(p.score).toBe(0);
    expect(p.resultats[0]!.correct).toBe(true);
  });
  it('blind test : le bonus de rapidité compte double', () => {
    const classique = repondre(creerPartie(base, [q('a')], mulberry32(7)), 'A', 0);
    const blind = repondre(creerPartie({ ...base, mode: 'blind_test' }, [q('a')], mulberry32(7)), 'A', 0);
    expect(classique.resultats[0]!.points.bonusRapidite).toBe(50);
    expect(blind.resultats[0]!.points.bonusRapidite).toBe(100);
  });
});

describe('duel local', () => {
  const duel: ConfigPartie = { ...base, mode: 'duel', joueurs: ['Léa', 'Sam', 'Noé'], nombreQuestions: 6 };
  it('chacun son tour, avec score et série par joueur', () => {
    let p = creerPartie(duel, stock(6), mulberry32(8));
    expect(p.questions.map((x) => x.joueur)).toEqual([0, 1, 2, 0, 1, 2]);
    // Léa répond juste deux fois, Sam juste une fois, Noé jamais.
    const justes = [true, true, false, true, false, false];
    p = jouer(p, (i) => justes[i]!);
    expect(p.phase).toBe('terminee');
    const r = resumerPartie(p);
    expect(r.classement!.map((j) => j.nom)).toEqual(['Léa', 'Sam', 'Noé']);
    expect(r.classement!.map((j) => j.bonnes)).toEqual([2, 1, 0]);
    expect(r.classement![0]!.meilleureSerie).toBe(2);
    expect(r.classement![2]!.score).toBe(0);
  });
  it('les jokers sont propres à chaque joueur', () => {
    let p = creerPartie(duel, stock(6), mulberry32(8));
    p = utiliserJoker(p, 'cinquante', mulberry32(8));
    p = questionSuivante(repondre(p, 'A', 1), mulberry32(8));
    expect(p.joueurCourant).toBe(1);
    expect(p.jokersUtilises).toEqual([]);
    expect(p.jokersRestants).toBe(2);
  });
  it('ex æquo : même rang', () => {
    const p = jouer(creerPartie({ ...duel, joueurs: ['A', 'B'], nombreQuestions: 2 }, stock(2), mulberry32(1)), () => false);
    expect(resumerPartie(p).classement!.map((j) => j.rang)).toEqual([1, 1]);
  });
});

describe('défi du jour', () => {
  const banque = banqueLocale();
  it('même date = mêmes questions et mêmes choix, pour tout le monde', () => {
    const a = questionsDuDefi(banque, '2026-10-12');
    const b = questionsDuDefi([...banque].reverse(), '2026-10-12');
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
    expect(a).toHaveLength(10);
  });
  it('change d’un jour à l’autre', () => {
    expect(questionsDuDefi(banque, '2026-10-12').map((x) => x.id)).not.toEqual(questionsDuDefi(banque, '2026-10-13').map((x) => x.id));
  });
  it('clé du jour au format AAAA-MM-JJ, en heure locale', () => {
    expect(cleJour(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
  it('série de jours consécutifs', () => {
    expect(serieDeJours(['2026-10-10', '2026-10-11', '2026-10-12'], '2026-10-12')).toBe(3);
    // Pas encore joué aujourd'hui : la série d'hier tient toujours.
    expect(serieDeJours(['2026-10-10', '2026-10-11'], '2026-10-12')).toBe(2);
    expect(serieDeJours(['2026-10-09', '2026-10-11'], '2026-10-12')).toBe(1);
    expect(serieDeJours(['2026-10-09'], '2026-10-12')).toBe(0);
    // Passage de mois.
    expect(serieDeJours(['2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2);
  });
});
