import type { CategorieJeu, NiveauQuestion, Question } from '@/types/question';
import { melanger, type Rng } from './random';
import { cleEnonce } from './texte';

/** Supprime les doublons (même énoncé normalisé), en gardant la première occurrence. */
export function dedoublonner(questions: Question[]): Question[] {
  const vues = new Set<string>();
  const resultat: Question[] = [];
  for (const q of questions) {
    const cle = cleEnonce(q.enonce);
    if (vues.has(cle)) continue;
    vues.add(cle);
    resultat.push(q);
  }
  return resultat;
}

export type CriteresSelection = {
  categorie: CategorieJeu;
  niveaux: NiveauQuestion[];
  nombre: number;
  rng: Rng;
  /** Ids vus récemment, à éviter autant que possible. */
  vuesRecemment?: ReadonlySet<string>;
};

function distanceNiveau(q: Question, niveaux: NiveauQuestion[]): number {
  return Math.min(...niveaux.map((n) => Math.abs(n - q.difficulte)));
}

/**
 * Sélectionne `nombre` questions :
 * 1. de la bonne catégorie (ou toutes pour le mix),
 * 2. en priorité aux niveaux demandés, puis aux niveaux voisins si la banque est trop petite,
 * 3. en évitant les questions vues récemment (sauf s'il n'y en a pas assez).
 */
export function selectionnerQuestions(banque: Question[], c: CriteresSelection): Question[] {
  const candidates = dedoublonner(
    c.categorie === 'mix' ? banque : banque.filter((q) => q.categorie === c.categorie),
  );
  const vues = c.vuesRecemment ?? new Set<string>();
  // Mélange puis tri stable par pénalité : un écart d'un niveau coûte 2,
  // une question déjà vue coûte 3 (on préfère une question neuve d'un niveau voisin).
  const triees = melanger(candidates, c.rng)
    .map((q) => ({ q, penalite: distanceNiveau(q, c.niveaux) * 2 + (vues.has(q.id) ? 3 : 0) }))
    .sort((a, b) => a.penalite - b.penalite);
  return melanger(
    triees.slice(0, c.nombre).map((x) => x.q),
    c.rng,
  );
}
