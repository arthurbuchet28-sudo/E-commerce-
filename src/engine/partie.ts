import {
  ADAPTATIF,
  BONUS_TEMPS_JOKER,
  DIFFICULTES,
  FACTEUR_MARGE_ESTIMATION,
  FACTEUR_TEMPS_MODE,
  ORDRE_DIFFICULTES,
  PROBA_SAISIE_EXPERT,
  type ChoixDifficulte,
  type Joker,
  type NiveauDifficulte,
} from '@/config/difficulte';
import { BLIND_TEST, MODES, SURVIE, type ModeJeu } from '@/config/modes';
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
import { melanger, rngAleatoire, type Rng } from './random';
import { calculerEtoiles, calculerPoints, type DetailPoints } from './scoring';

export type { ModeJeu };

export type ConfigPartie = {
  mode: ModeJeu;
  categorie: CategorieJeu;
  difficulte: ChoixDifficulte;
  /** Nombre de questions (total, tous joueurs confondus en duel). Ignoré en survie et contre-la-montre. */
  nombreQuestions: number;
  /** Duel : noms des joueurs, dans l'ordre de passage. */
  joueurs?: string[];
  /** Défi du jour : date au format AAAA-MM-JJ. */
  jour?: string;
  /** Libellé du filtre (blind test : époque ou style), pour l'affichage. */
  filtre?: string;
  /** Entre amis : graine du salon (mêmes questions et mêmes choix pour tous les joueurs). */
  salon?: string;
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
  /** Niveau de difficulté de la partie au moment de la question. */
  niveau: NiveauDifficulte;
  /** Duel : joueur à qui la question est posée. */
  joueur: number;
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
  joueur: number;
  /** Mode adaptatif / survie : la difficulté a changé après cette réponse. */
  changementNiveau?: 'hausse' | 'baisse';
  /** Survie : une vie a été perdue. */
  viePerdue?: boolean;
};

export type PhasePartie = 'question' | 'revelation' | 'terminee';

export type EtatJoueur = {
  nom: string;
  score: number;
  serie: number;
  meilleureSerie: number;
  jokersRestants: number;
  jokersUtilises: Joker[];
};

export type EtatPartie = {
  config: ConfigPartie;
  questions: QuestionPreparee[];
  index: number;
  phase: PhasePartie;
  /** Score, série et jokers du joueur courant (le seul joueur hors duel). */
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
  /** Niveau de difficulté courant (évolue en adaptatif et en survie). */
  niveau: NiveauDifficulte;
  adaptatif: { bonnes: number; erreurs: number };
  /** Survie : vies restantes (null dans les autres modes). */
  vies: number | null;
  /** Stock de questions pour les modes où la question suivante dépend du niveau. */
  reserve: Question[];
  /** Duel : état de chaque joueur (null hors duel). */
  joueurs: EtatJoueur[] | null;
  joueurCourant: number;
};

/** Niveau de départ : le niveau choisi, ou celui de départ du mode adaptatif. */
export function niveauInitial(config: ConfigPartie): NiveauDifficulte {
  return config.difficulte === 'adaptatif' ? ADAPTATIF.depart : config.difficulte;
}

/** La question suivante est-elle choisie au fil de l'eau, selon le niveau courant ? */
export function estDynamique(config: ConfigPartie): boolean {
  return config.mode === 'survie' || config.mode === 'contre_la_montre' || config.difficulte === 'adaptatif';
}

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

export function preparerQuestion(q: Question, difficulte: NiveauDifficulte, rng: Rng, joueur = 0): QuestionPreparee {
  const mode = modeDeReponse(q, difficulte, rng);
  const bonne = bonneReponseTexte(q);
  const margeBase = q.estimation?.marge ?? Math.max(1, Math.abs(Number(q.bonneReponse)) * 0.1);
  let choix: string[] = [];
  if (mode === 'choix') choix = preparerChoix(q, DIFFICULTES[difficulte].nbChoix, rng);
  if (mode === 'chronologie') choix = preparerChronologie(Array.isArray(q.bonneReponse) ? q.bonneReponse : [], rng);
  return { question: q, mode, choix, bonne, marge: margeBase * FACTEUR_MARGE_ESTIMATION[difficulte], niveau: difficulte, joueur };
}

function distanceNiveau(q: Question, niveau: NiveauDifficulte) {
  return Math.min(...DIFFICULTES[niveau].niveaux.map((n) => Math.abs(n - q.difficulte)));
}

/** Pioche dans le stock la question la plus adaptée au niveau (au hasard parmi les meilleures). */
export function piocher(reserve: Question[], niveau: NiveauDifficulte, rng: Rng): { question: Question | undefined; reste: Question[] } {
  if (!reserve.length) return { question: undefined, reste: reserve };
  const meilleure = Math.min(...reserve.map((q) => distanceNiveau(q, niveau)));
  const candidates = reserve.filter((q) => distanceNiveau(q, niveau) === meilleure);
  const question = candidates[Math.floor(rng() * candidates.length)]!;
  return { question, reste: reserve.filter((q) => q !== question) };
}

/**
 * Crée une partie.
 * - Modes à liste fixe : toutes les questions sont préparées d'avance.
 * - Modes dynamiques (survie, contre-la-montre, adaptatif) : `questions` sert de stock,
 *   et chaque question suivante est choisie selon le niveau atteint.
 */
export function creerPartie(config: ConfigPartie, questions: Question[], rng: Rng): EtatPartie {
  const niveau = niveauInitial(config);
  const nbJoueurs = config.mode === 'duel' ? Math.max(1, config.joueurs?.length ?? 1) : 1;
  const jokers = MODES[config.mode].score ? DIFFICULTES[niveau].jokers : 0;
  let preparees: QuestionPreparee[];
  let reserve: Question[] = [];
  if (estDynamique(config)) {
    const { question, reste } = piocher(melanger(questions, rng), niveau, rng);
    preparees = question ? [preparerQuestion(question, niveau, rng)] : [];
    reserve = reste;
  } else {
    preparees = questions.map((q, i) => preparerQuestion(q, niveau, rng, i % nbJoueurs));
  }
  return {
    config,
    questions: preparees,
    index: 0,
    phase: preparees.length ? 'question' : 'terminee',
    score: 0,
    serie: 0,
    meilleureSerie: 0,
    resultats: [],
    jokersRestants: jokers,
    jokersUtilises: [],
    choixMasques: [],
    indice: null,
    tempsBonus: 0,
    niveau,
    adaptatif: { bonnes: 0, erreurs: 0 },
    vies: config.mode === 'survie' ? SURVIE.vies : null,
    reserve,
    joueurs:
      config.mode === 'duel'
        ? (config.joueurs ?? ['Joueur 1']).map((nom) => ({ nom, score: 0, serie: 0, meilleureSerie: 0, jokersRestants: jokers, jokersUtilises: [] }))
        : null,
    joueurCourant: 0,
  };
}

export function questionCourante(etat: EtatPartie): QuestionPreparee | undefined {
  return etat.questions[etat.index];
}

/**
 * Temps accordé pour la question en cours (selon le niveau et le mode de réponse, avec bonus de joker),
 * ou null s'il n'y a pas de chrono par question (contre-la-montre, entraînement).
 */
export function tempsQuestion(etat: EtatPartie): number | null {
  if (MODES[etat.config.mode].chrono !== 'question') return null;
  const courante = questionCourante(etat);
  const niveau = courante?.niveau ?? etat.niveau;
  const facteur = courante ? FACTEUR_TEMPS_MODE[courante.mode] : 1;
  return Math.round(DIFFICULTES[niveau].tempsParQuestion * facteur) + etat.tempsBonus;
}

function cran(niveau: NiveauDifficulte, delta: number): NiveauDifficulte {
  const i = ORDRE_DIFFICULTES.indexOf(niveau);
  return ORDRE_DIFFICULTES[Math.max(0, Math.min(ORDRE_DIFFICULTES.length - 1, i + delta))]!;
}

/** Mode adaptatif : monte après N bonnes réponses d'affilée, baisse après M erreurs d'affilée. */
export function ajusterAdaptatif(
  niveau: NiveauDifficulte,
  compteurs: { bonnes: number; erreurs: number },
  correct: boolean,
): { niveau: NiveauDifficulte; compteurs: { bonnes: number; erreurs: number }; changement?: 'hausse' | 'baisse' } {
  if (correct) {
    const bonnes = compteurs.bonnes + 1;
    if (bonnes >= ADAPTATIF.monteeApresBonnes && niveau !== 'expert') return { niveau: cran(niveau, 1), compteurs: { bonnes: 0, erreurs: 0 }, changement: 'hausse' };
    return { niveau, compteurs: { bonnes, erreurs: 0 } };
  }
  const erreurs = compteurs.erreurs + 1;
  if (erreurs >= ADAPTATIF.descenteApresErreurs && niveau !== 'facile') return { niveau: cran(niveau, -1), compteurs: { bonnes: 0, erreurs: 0 }, changement: 'baisse' };
  return { niveau, compteurs: { bonnes: 0, erreurs } };
}

/** Survie : la difficulté monte d'un cran toutes les N questions. */
export function niveauSurvie(depart: NiveauDifficulte, questionsJouees: number): NiveauDifficulte {
  return cran(depart, Math.floor(questionsJouees / SURVIE.questionsParPalier));
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
    tolerance: DIFFICULTES[courante.niveau].tolerance,
    marge: courante.marge,
  });
  const serie = evaluation.correct ? etat.serie + 1 : 0;
  const compteScore = MODES[etat.config.mode].score;
  const points = calculerPoints({
    correct: evaluation.correct && compteScore,
    fraction: compteScore ? evaluation.fraction : 0,
    difficulte: courante.niveau,
    serie,
    tempsRestant: total === null ? null : Math.max(0, total - tempsMis),
    tempsTotal: total,
    bonusRapiditeMax: etat.config.mode === 'blind_test' ? BLIND_TEST.bonusRapiditeMax : undefined,
  });

  let niveau = etat.niveau;
  let adaptatif = etat.adaptatif;
  let changementNiveau: ResultatReponse['changementNiveau'];
  if (etat.config.difficulte === 'adaptatif' && etat.config.mode !== 'survie') {
    const a = ajusterAdaptatif(niveau, adaptatif, evaluation.correct);
    niveau = a.niveau;
    adaptatif = a.compteurs;
    changementNiveau = a.changement;
  }
  if (etat.config.mode === 'survie') {
    const suivant = niveauSurvie(niveauInitial(etat.config), etat.resultats.length + 1);
    if (suivant !== niveau) changementNiveau = 'hausse';
    niveau = suivant;
  }
  const viePerdue = etat.vies !== null && !evaluation.correct;

  const resultat: ResultatReponse = {
    questionId: courante.question.id,
    categorie: courante.question.categorie,
    reponse: reponseEnTexte(reponse, courante.question.estimation?.unite),
    correct: evaluation.correct,
    fraction: evaluation.fraction,
    ecart: evaluation.ecart,
    passee: false,
    tempsMis: total === null ? tempsMis : Math.min(tempsMis, total),
    points,
    serie,
    joueur: etat.joueurCourant,
    changementNiveau,
    viePerdue: viePerdue || undefined,
  };
  return {
    ...etat,
    phase: 'revelation',
    score: etat.score + points.total,
    serie,
    meilleureSerie: Math.max(etat.meilleureSerie, serie),
    resultats: [...etat.resultats, resultat],
    niveau,
    adaptatif,
    vies: etat.vies === null ? null : etat.vies - (viePerdue ? 1 : 0),
  };
}

/** Le joker a-t-il un sens pour ce type de question ? */
export function jokerApplicable(q: QuestionPreparee, joker: Joker): boolean {
  if (joker === 'cinquante') return q.mode === 'choix' && q.choix.length > 2;
  return true;
}

export function jokerDisponible(etat: EtatPartie, joker: Joker): boolean {
  const courante = questionCourante(etat);
  if (joker === 'temps' && tempsQuestion(etat) === null) return false;
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

/** Applique un joker (chaque joker n'est utilisable qu'une fois par partie et par joueur). */
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
      // La question est passée : pas de points, la série est conservée, aucune vie perdue.
      const resultat: ResultatReponse = {
        questionId: courante.question.id,
        categorie: courante.question.categorie,
        reponse: null,
        correct: false,
        fraction: 0,
        passee: true,
        tempsMis,
        points: calculerPoints({ correct: false, difficulte: courante.niveau, serie: 0, tempsRestant: null, tempsTotal: null }),
        serie: etat.serie,
        joueur: etat.joueurCourant,
      };
      return { ...base, phase: 'revelation', resultats: [...base.resultats, resultat] };
    }
  }
}

/** La partie s'arrête-t-elle après la question en cours ? */
function derniereQuestion(etat: EtatPartie): boolean {
  if (etat.vies !== null && etat.vies <= 0) return true;
  if (estDynamique(etat.config)) {
    if (!etat.reserve.length) return true;
    if (etat.config.mode === 'survie' || etat.config.mode === 'contre_la_montre') return false;
    return etat.index + 1 >= etat.config.nombreQuestions;
  }
  return etat.index + 1 >= etat.questions.length;
}

/** Duel : sauvegarde l'état du joueur courant et charge celui du joueur suivant. */
function passerAuJoueur(etat: EtatPartie, suivant: number): EtatPartie {
  if (!etat.joueurs || suivant === etat.joueurCourant) return etat;
  const joueurs = etat.joueurs.map((j, i) =>
    i === etat.joueurCourant
      ? { ...j, score: etat.score, serie: etat.serie, meilleureSerie: etat.meilleureSerie, jokersRestants: etat.jokersRestants, jokersUtilises: etat.jokersUtilises }
      : j,
  );
  const j = joueurs[suivant]!;
  return {
    ...etat,
    joueurs,
    joueurCourant: suivant,
    score: j.score,
    serie: j.serie,
    meilleureSerie: j.meilleureSerie,
    jokersRestants: j.jokersRestants,
    jokersUtilises: j.jokersUtilises,
  };
}

/** Passe à la question suivante, ou termine la partie. */
export function questionSuivante(etat: EtatPartie, rng: Rng = rngAleatoire()): EtatPartie {
  if (etat.phase !== 'revelation') return etat;
  const reset = { choixMasques: [], indice: null, tempsBonus: 0 };
  if (derniereQuestion(etat)) return terminer({ ...etat, ...reset });
  const index = etat.index + 1;
  if (estDynamique(etat.config)) {
    const { question, reste } = piocher(etat.reserve, etat.niveau, rng);
    if (!question) return terminer({ ...etat, ...reset });
    return { ...etat, ...reset, index, phase: 'question', reserve: reste, questions: [...etat.questions, preparerQuestion(question, etat.niveau, rng)] };
  }
  const suivant = passerAuJoueur(etat, etat.questions[index]!.joueur);
  return { ...suivant, ...reset, index, phase: 'question' };
}

/** Termine la partie (fin normale, ou temps écoulé en contre-la-montre : la question en cours n'est pas comptée). */
export function terminer(etat: EtatPartie): EtatPartie {
  // Duel : on enregistre l'état du dernier joueur.
  const joueurs =
    etat.joueurs?.map((j, i) =>
      i === etat.joueurCourant ? { ...j, score: etat.score, serie: etat.serie, meilleureSerie: etat.meilleureSerie } : j,
    ) ?? null;
  const questions = etat.questions.slice(0, etat.resultats.length);
  return { ...etat, joueurs, questions, index: Math.max(0, questions.length - 1), phase: 'terminee' };
}

export type ScoreJoueur = { nom: string; score: number; bonnes: number; meilleureSerie: number; rang: number };

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
  /** Duel : classement des joueurs (ex æquo au même rang). */
  classement: ScoreJoueur[] | null;
};

export function resumerPartie(etat: EtatPartie): ResumePartie {
  const repondues = etat.resultats.filter((r) => !r.passee);
  const bonnes = repondues.filter((r) => r.correct).length;
  const precision = repondues.length ? bonnes / repondues.length : 0;
  const tempsMoyen = repondues.length ? repondues.reduce((s, r) => s + r.tempsMis, 0) / repondues.length : 0;
  let classement: ScoreJoueur[] | null = null;
  if (etat.joueurs) {
    const tries = etat.joueurs
      .map((j, i) => ({
        nom: j.nom,
        score: j.score,
        bonnes: etat.resultats.filter((r) => r.joueur === i && r.correct).length,
        meilleureSerie: j.meilleureSerie,
        rang: 0,
      }))
      .sort((a, b) => b.score - a.score || b.bonnes - a.bonnes);
    classement = tries.map((j) => ({ ...j, rang: 1 + tries.filter((x) => x.score > j.score || (x.score === j.score && x.bonnes > j.bonnes)).length }));
  }
  return {
    score: etat.joueurs ? etat.joueurs.reduce((s, j) => s + j.score, 0) : etat.score,
    bonnes,
    repondues: repondues.length,
    total: etat.questions.length,
    precision,
    tempsMoyen,
    meilleureSerie: etat.joueurs ? Math.max(...etat.joueurs.map((j) => j.meilleureSerie)) : etat.meilleureSerie,
    etoiles: calculerEtoiles(precision),
    jokersUtilises: etat.jokersUtilises.length,
    classement,
  };
}

/** Grille façon Wordle : 🟩 bonne, 🟨 partiellement juste, 🟥 mauvaise, ⬜ passée. */
export function grilleEmojis(resultats: ResultatReponse[]): string {
  return resultats.map((r) => (r.passee ? '⬜' : r.correct ? '🟩' : r.fraction > 0 ? '🟨' : '🟥')).join('');
}
