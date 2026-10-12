import { DEFI } from '@/config/modes';
import type { Question } from '@/types/question';
import { rngDepuisChaine, type Rng } from './random';
import { selectionnerQuestions } from './selection';

/** Date locale au format AAAA-MM-JJ (le défi change à minuit, heure du joueur). */
export function cleJour(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${j}`;
}

/** Générateur aléatoire du défi : même date → même suite, donc mêmes questions et mêmes choix pour tout le monde. */
export function rngDuJour(jour: string): Rng {
  return rngDepuisChaine(`quizmania-defi-${jour}`);
}

/**
 * Questions du défi du jour : tirées de la banque locale uniquement (identique pour tous,
 * jouable hors ligne), toutes catégories, sans médias, au niveau du défi.
 */
export function questionsDuDefi(banque: Question[], jour: string): Question[] {
  const rng = rngDuJour(jour);
  // Ordre stable de la banque, indépendant de l'ordre de chargement des fichiers.
  const triee = banque.filter((q) => q.source === 'local' && !q.media).sort((a, b) => a.id.localeCompare(b.id));
  return selectionnerQuestions(triee, { categorie: 'mix', niveaux: [1, 2], nombre: DEFI.nombre, rng });
}

function jourPrecedent(jour: string): string {
  const [a, m, j] = jour.split('-').map(Number);
  return cleJour(new Date(a!, m! - 1, j! - 1));
}

/**
 * Série de jours consécutifs : se compte depuis aujourd'hui si le défi du jour est joué,
 * sinon depuis hier (la série n'est pas encore perdue tant que la journée n'est pas finie).
 */
export function serieDeJours(joues: Iterable<string>, aujourdhui: string): number {
  const ensemble = new Set(joues);
  let jour = ensemble.has(aujourdhui) ? aujourdhui : jourPrecedent(aujourdhui);
  let serie = 0;
  while (ensemble.has(jour)) {
    serie++;
    jour = jourPrecedent(jour);
  }
  return serie;
}
