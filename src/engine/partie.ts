import {
  BONUS_TEMPS_JOKER,
  DIFFICULTES,
  type Joker,
  type NiveauDifficulte,
} from '@/config/difficulte';
import type { CategorieJeu, Question } from '@/types/question';
import { bonneReponseTexte, cinquanteCinquante, estCorrect, indicePremiereLettre, preparerChoix } from './qcm';
import type { Rng } from './random';
import { calculerEtoiles, calculerPoints, type DetailPoints } from './scoring';

export type ModeJeu = 'classique';

export type ConfigPartie = {
  mode: ModeJeu;
  categorie: CategorieJeu;
  difficulte: NiveauDifficulte;
  nombreQuestions: number;
};

export type QuestionPreparee = {
  question: Question;
  choix: string[];
  bonne: string;
};

export type ResultatReponse = {
  questionId: string;
  categorie: Question['categorie'];
  /** null = temps écoulé ou question passée. */
  reponse: string | null;
  correct: boolean;
  passee: boolean;
  /** Secondes mises pour répondre. */
  tempsMis: number;
  points: DetailPoints;
  /** Série après cette réponse. */
  serie: number;
};

export type PhasePartie = 'question' | 'revelation' | 'terminee';

export type EtatPartie = {
  config: ConfigPartie;
  questions: QuestionPreparee[];
  index: number;
  phase: PhasePartie;
  score: number;
  serie: number;
  meilleureSerie: number;
  resultats: ResultatReponse[];
  jokersRestants: number;
  jokersUtilises: Joker[];
  /** Effets de joker sur la question en cours. */
  choixMasques: string[];
  indice: string | null;
  tempsBonus: number;
};

export function creerPartie(config: ConfigPartie, questions: Question[], rng: Rng): EtatPartie {
  const params = DIFFICULTES[config.difficulte];
  return {
    config,
    questions: questions.map((q) => ({
      question: q,
      choix: preparerChoix(q, params.nbChoix, rng),
      bonne: bonneReponseTexte(q),
    })),
    index: 0,
    phase: 'question',
    score: 0,
    serie: 0,
    meilleureSerie: 0,
    resultats: [],
    jokersRestants: params.jokers,
    jokersUtilises: [],
    choixMasques: [],
    indice: null,
    tempsBonus: 0,
  };
}

export function questionCourante(etat: EtatPartie): QuestionPreparee | undefined {
  return etat.questions[etat.index];
}

/** Temps total accordé pour la question en cours (avec bonus de joker). */
export function tempsQuestion(etat: EtatPartie): number {
  return DIFFICULTES[etat.config.difficulte].tempsParQuestion + etat.tempsBonus;
}

/**
 * Enregistre la réponse du joueur (ou null si le temps est écoulé).
 * Ne fait rien si on n'est pas en phase « question ».
 */
export function repondre(etat: EtatPartie, reponse: string | null, tempsMis: number): EtatPartie {
  const courante = questionCourante(etat);
  if (etat.phase !== 'question' || !courante) return etat;
  const total = tempsQuestion(etat);
  const correct = reponse !== null && estCorrect(courante.question, reponse);
  const serie = correct ? etat.serie + 1 : 0;
  const points = calculerPoints({
    correct,
    difficulte: etat.config.difficulte,
    serie,
    tempsRestant: Math.max(0, total - tempsMis),
    tempsTotal: total,
  });
  const resultat: ResultatReponse = {
    questionId: courante.question.id,
    categorie: courante.question.categorie,
    reponse,
    correct,
    passee: false,
    tempsMis: Math.min(tempsMis, total),
    points,
    serie,
  };
  return {
    ...etat,
    phase: 'revelation',
    score: etat.score + points.total,
    serie,
    meilleureSerie: Math.max(etat.meilleureSerie, serie),
    resultats: [...etat.resultats, resultat],
  };
}

export function jokerDisponible(etat: EtatPartie, joker: Joker): boolean {
  return etat.phase === 'question' && etat.jokersRestants > 0 && !etat.jokersUtilises.includes(joker);
}

/** Applique un joker (chaque joker n'est utilisable qu'une fois par partie). */
export function utiliserJoker(etat: EtatPartie, joker: Joker, rng: Rng, tempsMis = 0): EtatPartie {
  const courante = questionCourante(etat);
  if (!courante || !jokerDisponible(etat, joker)) return etat;
  const base: EtatPartie = {
    ...etat,
    jokersRestants: etat.jokersRestants - 1,
    jokersUtilises: [...etat.jokersUtilises, joker],
  };
  switch (joker) {
    case 'cinquante':
      return { ...base, choixMasques: cinquanteCinquante(courante.choix, courante.bonne, rng) };
    case 'indice':
      return { ...base, indice: indicePremiereLettre(courante.bonne) };
    case 'temps':
      return { ...base, tempsBonus: base.tempsBonus + BONUS_TEMPS_JOKER };
    case 'passer': {
      // La question est passée : pas de points, la série est conservée.
      const resultat: ResultatReponse = {
        questionId: courante.question.id,
        categorie: courante.question.categorie,
        reponse: null,
        correct: false,
        passee: true,
        tempsMis,
        points: calculerPoints({ correct: false, difficulte: etat.config.difficulte, serie: 0, tempsRestant: null, tempsTotal: null }),
        serie: etat.serie,
      };
      return { ...base, phase: 'revelation', resultats: [...base.resultats, resultat] };
    }
  }
}

/** Passe à la question suivante, ou termine la partie. */
export function questionSuivante(etat: EtatPartie): EtatPartie {
  if (etat.phase !== 'revelation') return etat;
  const index = etat.index + 1;
  const reset = { choixMasques: [], indice: null, tempsBonus: 0 };
  if (index >= etat.questions.length) return { ...etat, ...reset, phase: 'terminee' };
  return { ...etat, ...reset, index, phase: 'question' };
}

export type ResumePartie = {
  score: number;
  bonnes: number;
  repondues: number;
  total: number;
  precision: number;
  tempsMoyen: number;
  meilleureSerie: number;
  etoiles: 1 | 2 | 3;
  jokersUtilises: number;
};

export function resumerPartie(etat: EtatPartie): ResumePartie {
  const repondues = etat.resultats.filter((r) => !r.passee);
  const bonnes = repondues.filter((r) => r.correct).length;
  const precision = repondues.length ? bonnes / repondues.length : 0;
  const tempsMoyen = repondues.length ? repondues.reduce((s, r) => s + r.tempsMis, 0) / repondues.length : 0;
  return {
    score: etat.score,
    bonnes,
    repondues: repondues.length,
    total: etat.questions.length,
    precision,
    tempsMoyen,
    meilleureSerie: etat.meilleureSerie,
    etoiles: calculerEtoiles(precision),
    jokersUtilises: etat.jokersUtilises.length,
  };
}

/** Grille façon Wordle : 🟩 bonne, 🟥 mauvaise, ⬜ passée. */
export function grilleEmojis(resultats: ResultatReponse[]): string {
  return resultats.map((r) => (r.passee ? '⬜' : r.correct ? '🟩' : '🟥')).join('');
}
