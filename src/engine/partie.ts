import {
  BONUS_TEMPS_JOKER,
  DIFFICULTES,
  FACTEUR_MARGE_ESTIMATION,
  FACTEUR_TEMPS_MODE,
  PROBA_SAISIE_EXPERT,
  type Joker,
  type NiveauDifficulte,
} from '@/config/difficulte';
import type { CategorieJeu, Question } from '@/types/question';
import { evaluer, reponseEnTexte, type ModeReponse, type Reponse } from './evaluation';
import {
  bonneReponseTexte,
  cinquanteCinquante,
  indiceFourchette,
  indicePremiereLettre,
  preparerChoix,
  preparerChronologie,
} from './qcm';
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
  mode: ModeReponse;
  /** Choix affichés (mode choix) ou éléments à ordonner (chronologie). */
  choix: string[];
  /** Bonne réponse en texte. */
  bonne: string;
  /** Marge effective des estimations. */
  marge: number;
};

export type ResultatReponse = {
  questionId: string;
  categorie: Question['categorie'];
  /** Réponse lisible ; null = temps écoulé ou question passée. */
  reponse: string | null;
  correct: boolean;
  /** Part des points obtenue (0 → 1). */
  fraction: number;
  ecart?: number;
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

/** Choisit la façon de répondre à une question selon son type et la difficulté. */
export function modeDeReponse(q: Question, difficulte: NiveauDifficulte, rng: Rng): ModeReponse {
  switch (q.type) {
    case 'saisie':
      return 'saisie';
    case 'chronologie':
      return 'chronologie';
    case 'estimation':
      return 'estimation';
    case 'qcm':
      // En Expert, certains QCM se jouent en saisie libre (« 6 choix ou saisie libre »).
      return difficulte === 'expert' && q.reponsesAcceptees?.length && rng() < PROBA_SAISIE_EXPERT ? 'saisie' : 'choix';
    default:
      return 'choix';
  }
}

export function preparerQuestion(q: Question, difficulte: NiveauDifficulte, rng: Rng): QuestionPreparee {
  const mode = modeDeReponse(q, difficulte, rng);
  const bonne = bonneReponseTexte(q);
  const margeBase = q.estimation?.marge ?? Math.max(1, Math.abs(Number(q.bonneReponse)) * 0.1);
  let choix: string[] = [];
  if (mode === 'choix') choix = preparerChoix(q, DIFFICULTES[difficulte].nbChoix, rng);
  if (mode === 'chronologie') choix = preparerChronologie(Array.isArray(q.bonneReponse) ? q.bonneReponse : [], rng);
  return { question: q, mode, choix, bonne, marge: margeBase * FACTEUR_MARGE_ESTIMATION[difficulte] };
}

export function creerPartie(config: ConfigPartie, questions: Question[], rng: Rng): EtatPartie {
  return {
    config,
    questions: questions.map((q) => preparerQuestion(q, config.difficulte, rng)),
    index: 0,
    phase: 'question',
    score: 0,
    serie: 0,
    meilleureSerie: 0,
    resultats: [],
    jokersRestants: DIFFICULTES[config.difficulte].jokers,
    jokersUtilises: [],
    choixMasques: [],
    indice: null,
    tempsBonus: 0,
  };
}

export function questionCourante(etat: EtatPartie): QuestionPreparee | undefined {
  return etat.questions[etat.index];
}

/** Temps total accordé pour la question en cours (selon le mode, avec bonus de joker). */
export function tempsQuestion(etat: EtatPartie): number {
  const courante = questionCourante(etat);
  const facteur = courante ? FACTEUR_TEMPS_MODE[courante.mode] : 1;
  return Math.round(DIFFICULTES[etat.config.difficulte].tempsParQuestion * facteur) + etat.tempsBonus;
}

/**
 * Enregistre la réponse du joueur (ou null si le temps est écoulé).
 * Ne fait rien si on n'est pas en phase « question ».
 */
export function repondre(etat: EtatPartie, reponse: Reponse, tempsMis: number): EtatPartie {
  const courante = questionCourante(etat);
  if (etat.phase !== 'question' || !courante) return etat;
  const total = tempsQuestion(etat);
  const evaluation = evaluer(courante.question, reponse, {
    mode: courante.mode,
    bonne: courante.bonne,
    tolerance: DIFFICULTES[etat.config.difficulte].tolerance,
    marge: courante.marge,
  });
  const serie = evaluation.correct ? etat.serie + 1 : 0;
  const points = calculerPoints({
    correct: evaluation.correct,
    fraction: evaluation.fraction,
    difficulte: etat.config.difficulte,
    serie,
    tempsRestant: Math.max(0, total - tempsMis),
    tempsTotal: total,
  });
  const resultat: ResultatReponse = {
    questionId: courante.question.id,
    categorie: courante.question.categorie,
    reponse: reponseEnTexte(reponse, courante.question.estimation?.unite),
    correct: evaluation.correct,
    fraction: evaluation.fraction,
    ecart: evaluation.ecart,
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

/** Le joker a-t-il un sens pour ce type de question ? */
export function jokerApplicable(q: QuestionPreparee, joker: Joker): boolean {
  if (joker === 'cinquante') return q.mode === 'choix' && q.choix.length > 2;
  return true;
}

export function jokerDisponible(etat: EtatPartie, joker: Joker): boolean {
  const courante = questionCourante(etat);
  return (
    etat.phase === 'question' &&
    etat.jokersRestants > 0 &&
    !etat.jokersUtilises.includes(joker) &&
    courante !== undefined &&
    jokerApplicable(courante, joker)
  );
}

function indicePour(q: QuestionPreparee, rng: Rng): string {
  if (q.mode === 'estimation') return indiceFourchette(Number(q.question.bonneReponse), q.marge, rng);
  if (q.mode === 'chronologie') {
    const premier = Array.isArray(q.question.bonneReponse) ? q.question.bonneReponse[0] : undefined;
    return `Le plus ancien : « ${premier ?? '?'} »`;
  }
  return indicePremiereLettre(q.bonne);
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
      return { ...base, indice: indicePour(courante, rng) };
    case 'temps':
      return { ...base, tempsBonus: base.tempsBonus + BONUS_TEMPS_JOKER };
    case 'passer': {
      // La question est passée : pas de points, la série est conservée.
      const resultat: ResultatReponse = {
        questionId: courante.question.id,
        categorie: courante.question.categorie,
        reponse: null,
        correct: false,
        fraction: 0,
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

/** Grille façon Wordle : 🟩 bonne, 🟨 partiellement juste, 🟥 mauvaise, ⬜ passée. */
export function grilleEmojis(resultats: ResultatReponse[]): string {
  return resultats.map((r) => (r.passee ? '⬜' : r.correct ? '🟩' : r.fraction > 0 ? '🟨' : '🟥')).join('');
}
