import { describe, expect, it } from 'vitest';
import { BADGES } from '@/config/progression';
import type { Categorie, NiveauQuestion, Question } from '@/types/question';
import { creerPartie, questionSuivante, repondre, type ConfigPartie, type EtatPartie } from '../partie';
import {
  STATS_VIDES,
  classement,
  entreeHistorique,
  forcesEtFaiblesses,
  majStatistiques,
  niveauDepuisXp,
  nouveauxBadges,
  questionsCorrigees,
  questionsRatees,
  seuilNiveau,
  titrePourNiveau,
  xpPourPartie,
} from '../progression';
import { mulberry32 } from '../random';

function q(id: string, extra: Partial<Question> = {}): Question {
  return { id, source: 't', categorie: 'histoire', type: 'qcm', difficulte: 1 as NiveauQuestion, enonce: `Q ${id} ?`, choix: ['A', 'B', 'C', 'D'], bonneReponse: 'A', ...extra };
}
const base: ConfigPartie = { mode: 'classique', categorie: 'histoire', difficulte: 'facile', nombreQuestions: 10 };

function jouer(config: ConfigPartie, questions: Question[], reponses: (string | number | string[])[], temps = 5): EtatPartie {
  let p = creerPartie(config, questions, mulberry32(1));
  for (const r of reponses) {
    p = questionSuivante(repondre(p, r, temps), mulberry32(1));
  }
  return p;
}
const dix = Array.from({ length: 10 }, (_, i) => q(`q${i}`));

describe('niveaux et titres', () => {
  it('seuils croissants : 0, 100, 300, 600…', () => {
    expect([1, 2, 3, 4].map(seuilNiveau)).toEqual([0, 100, 300, 600]);
  });
  it('niveau et progression depuis l’XP', () => {
    expect(niveauDepuisXp(0)).toMatchObject({ niveau: 1, titre: 'Curieux', progression: 0 });
    expect(niveauDepuisXp(99).niveau).toBe(1);
    expect(niveauDepuisXp(100).niveau).toBe(2);
    expect(niveauDepuisXp(200)).toMatchObject({ niveau: 2, xpDebut: 100, xpFin: 300, progression: 0.5 });
  });
  it('titres amusants', () => {
    expect(titrePourNiveau(1)).toBe('Curieux');
    expect(titrePourNiveau(8)).toBe('Érudit');
    expect(titrePourNiveau(25)).toBe('Encyclopédie vivante');
    expect(titrePourNiveau(99)).toBe('Légende de QuizMania');
  });
});

describe('XP d’une partie', () => {
  it('10 par bonne réponse × difficulté, 1 par erreur, bonus de partie parfaite', () => {
    const parfaite = jouer(base, dix, Array(10).fill('A'));
    expect(xpPourPartie(parfaite)).toBe(10 * 10 + 50);
    const moitie = jouer(base, dix, ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']);
    expect(xpPourPartie(moitie)).toBe(5 * 10 + 5 * 1);
    const expert = jouer({ ...base, difficulte: 'expert' }, dix.slice(0, 2), ['A', 'A']);
    expect(xpPourPartie(expert)).toBe(2 * 10 * 3);
  });
  it('moitié moins en entraînement', () => {
    expect(xpPourPartie(jouer({ ...base, mode: 'entrainement' }, dix.slice(0, 2), ['A', 'A']))).toBe(10);
  });
});

describe('statistiques', () => {
  it('cumule par catégorie et par mode, et retient les records', () => {
    const qs = [q('a'), q('b', { categorie: 'sport' }), q('c', { type: 'saisie', bonneReponse: 'Paris', choix: undefined }), q('d', { type: 'estimation', bonneReponse: 1789, estimation: { marge: 10 }, choix: undefined })];
    const p = jouer(base, qs, ['A', 'B', 'paris', 1789], 1);
    const s = majStatistiques(STATS_VIDES, p, new Date(2026, 9, 12, 14));
    expect(s).toMatchObject({ parties: 1, questions: 4, bonnes: 3, saisiesJustes: 1, estimationsExactes: 1, reponsesEclair: 3, partiesNocturnes: 0 });
    expect(s.parCategorie.histoire).toEqual({ questions: 3, bonnes: 3 });
    expect(s.parCategorie.sport).toEqual({ questions: 1, bonnes: 0 });
    expect(s.parMode.classique).toBe(1);
    const s2 = majStatistiques(s, p, new Date(2026, 9, 13, 2));
    expect(s2).toMatchObject({ parties: 2, bonnes: 6, partiesNocturnes: 1 });
    // L'objet d'origine n'est pas modifié.
    expect(s.parCategorie.histoire).toEqual({ questions: 3, bonnes: 3 });
  });
  it('catégorie forte et catégorie à travailler', () => {
    const stats = { ...STATS_VIDES, parCategorie: { histoire: { questions: 10, bonnes: 9 }, sport: { questions: 10, bonnes: 2 }, gastronomie: { questions: 2, bonnes: 0 } } as Record<Categorie, { questions: number; bonnes: number }> };
    expect(forcesEtFaiblesses(stats)).toEqual({ forte: 'histoire', aTravailler: 'sport' });
    expect(forcesEtFaiblesses(STATS_VIDES)).toEqual({});
  });
});

describe('badges', () => {
  it('au moins 20 badges aux identifiants uniques', () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
  it('débloque les badges mérités, une seule fois', () => {
    const p = jouer(base, dix, Array(10).fill('A'), 1);
    const stats = majStatistiques(STATS_VIDES, p, new Date(2026, 9, 12, 14));
    const ids = nouveauxBadges({ stats, niveau: 2, serieDefi: 0 }, []).map((b) => b.id);
    expect(ids).toEqual(expect.arrayContaining(['premiere-partie', 'sans-faute', 'en-feu', 'inarretable', 'reflexe']));
    expect(ids).not.toContain('habitue');
    expect(nouveauxBadges({ stats, niveau: 2, serieDefi: 0 }, ids)).toEqual([]);
  });
  it('badges de série du défi et d’oreille musicale', () => {
    const stats = { ...STATS_VIDES, parCategorie: { chansons_francaises: { questions: 150, bonnes: 100 } } };
    const ids = nouveauxBadges({ stats, niveau: 1, serieDefi: 10 }, []).map((b) => b.id);
    expect(ids).toEqual(expect.arrayContaining(['oreille-d-or', 'fidele', 'regulier']));
  });
});

describe('historique, classement, révision', () => {
  it('classement par mode et difficulté, joueurs de duel compris', () => {
    const date = new Date(2026, 9, 12);
    const solo = entreeHistorique(jouer(base, dix.slice(0, 3), ['A', 'A', 'B']), 'Alex', date);
    const duel = entreeHistorique(
      jouer({ ...base, mode: 'duel', joueurs: ['Léa', 'Sam'], nombreQuestions: 4 }, dix.slice(0, 4), ['A', 'A', 'A', 'B']),
      'Alex',
      new Date(2026, 9, 13),
    );
    expect(solo.joueurs).toEqual([{ nom: 'Alex', score: solo.score }]);
    expect(duel.joueurs.map((j) => j.nom)).toEqual(['Léa', 'Sam']);
    const top = classement([solo, duel], 'duel');
    expect(top.map((l) => l.nom)).toEqual(['Léa', 'Sam']);
    expect(top[0]!.rang).toBe(1);
    expect(classement([solo, duel], 'classique', 'facile')).toHaveLength(1);
    expect(classement([solo, duel], 'classique', 'expert')).toHaveLength(0);
  });
  it('questions ratées à réviser, et corrigées en révision', () => {
    const p = jouer(base, dix.slice(0, 3), ['A', 'B', 'C']);
    expect(questionsRatees(p).map((x) => x.id)).toEqual(['q1', 'q2']);
    expect(questionsCorrigees(p)).toEqual(['q0']);
  });
});
