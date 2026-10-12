import { SEUIL_ESTIMATION_JUSTE, TOLERANCE_LEVENSHTEIN, type ToleranceSaisie } from '@/config/difficulte';
import type { Question } from '@/types/question';
import { normaliserTexte } from './texte';

/** Façon de répondre à une question, une fois préparée pour la partie. */
export type ModeReponse = 'choix' | 'saisie' | 'chronologie' | 'estimation';

/** Réponse du joueur : un choix ou un texte, un ordre, un nombre, ou rien (temps écoulé). */
export type Reponse = string | string[] | number | null;

export type Evaluation = {
  correct: boolean;
  /** Part des points obtenue, de 0 à 1 (dégressif pour estimation et chronologie). */
  fraction: number;
  /** Écart à la bonne valeur (estimation). */
  ecart?: number;
};

/** Distance de Levenshtein (nombre minimal d'insertions, suppressions, substitutions). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let precedente = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const courante = [i];
    for (let j = 1; j <= b.length; j++) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      courante[j] = Math.min(precedente[j]! + 1, courante[j - 1]! + 1, precedente[j - 1]! + cout);
    }
    precedente = courante;
  }
  return precedente[b.length]!;
}

/** Nombre de fautes tolérées pour une réponse attendue de cette longueur. */
export function fautesTolerees(longueur: number, tolerance: ToleranceSaisie): number {
  return Math.floor(longueur * TOLERANCE_LEVENSHTEIN[tolerance]);
}

/** Toutes les formes acceptées pour une saisie libre. */
export function reponsesAttendues(q: Question): string[] {
  const principale = Array.isArray(q.bonneReponse) ? q.bonneReponse.join(' ') : String(q.bonneReponse);
  return [principale, ...(q.reponsesAcceptees ?? [])];
}

/**
 * Saisie libre : insensible à la casse, aux accents, à la ponctuation et aux articles,
 * avec un nombre de fautes toléré selon la difficulté. Les nombres doivent être exacts.
 */
export function saisieCorrecte(saisie: string, attendues: string[], tolerance: ToleranceSaisie): boolean {
  const s = normaliserTexte(saisie);
  if (!s) return false;
  return attendues.some((a) => {
    const n = normaliserTexte(a);
    if (!n) return false;
    if (/^\d+$/.test(n)) return s.replace(/\s/g, '') === n;
    return levenshtein(s, n) <= fautesTolerees(n.length, tolerance);
  });
}

/** Estimation : 100 % si exact, puis dégressif jusqu'à 0 à `marge` d'écart. */
export function evaluerEstimation(valeur: number, bonne: number, marge: number): Evaluation {
  const ecart = Math.abs(valeur - bonne);
  const fraction = ecart === 0 ? 1 : Math.max(0, 1 - ecart / Math.max(marge, Number.EPSILON));
  return { correct: fraction >= SEUIL_ESTIMATION_JUSTE, fraction, ecart };
}

/** Chronologie : part des éléments à la bonne place ; juste seulement si tout est en ordre. */
export function evaluerChronologie(ordre: string[], bonOrdre: string[]): Evaluation {
  const bienPlaces = bonOrdre.filter((e, i) => ordre[i] === e).length;
  const fraction = bonOrdre.length ? bienPlaces / bonOrdre.length : 0;
  return { correct: fraction === 1, fraction };
}

export type ContexteEvaluation = {
  mode: ModeReponse;
  /** Bonne réponse affichée (texte du bon choix). */
  bonne: string;
  tolerance: ToleranceSaisie;
  /** Marge effective (déjà ajustée à la difficulté) pour les estimations. */
  marge: number;
};

export function evaluer(q: Question, reponse: Reponse, c: ContexteEvaluation): Evaluation {
  if (reponse === null) return { correct: false, fraction: 0 };
  switch (c.mode) {
    case 'choix': {
      const ok = reponse === c.bonne;
      return { correct: ok, fraction: ok ? 1 : 0 };
    }
    case 'saisie': {
      const ok = saisieCorrecte(String(reponse), reponsesAttendues(q), c.tolerance);
      return { correct: ok, fraction: ok ? 1 : 0 };
    }
    case 'estimation': {
      const valeur = typeof reponse === 'number' ? reponse : Number.parseFloat(String(reponse).replace(',', '.'));
      if (!Number.isFinite(valeur)) return { correct: false, fraction: 0 };
      return evaluerEstimation(valeur, Number(q.bonneReponse), c.marge);
    }
    case 'chronologie': {
      const bonOrdre = Array.isArray(q.bonneReponse) ? q.bonneReponse : [];
      return evaluerChronologie(Array.isArray(reponse) ? reponse : [], bonOrdre);
    }
  }
}

/** Texte lisible d'une réponse du joueur (récapitulatif, partage). */
export function reponseEnTexte(reponse: Reponse, unite?: string): string | null {
  if (reponse === null) return null;
  if (Array.isArray(reponse)) return reponse.join(' → ');
  if (typeof reponse === 'number') return formaterNombre(reponse) + (unite ? ` ${unite}` : '');
  return reponse;
}

export function formaterNombre(n: number): string {
  // Les années restent sans séparateur de milliers.
  if (Number.isInteger(n) && n >= 1000 && n <= 2100) return String(n);
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}
