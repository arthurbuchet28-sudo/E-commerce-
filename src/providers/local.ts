import { CATEGORIES, type Categorie, type Question } from '@/types/question';
import type { CriteresRecuperation, FournisseurQuestions } from './types';

type FichierBanque = {
  categorie: Categorie;
  questions: Omit<Question, 'source' | 'categorie'>[];
};

const fichiers = import.meta.glob<FichierBanque>('../data/questions/*.json', { eager: true, import: 'default' });

/** Transforme le contenu d'un fichier JSON de la banque en questions normalisées. */
export function normaliserFichierLocal(fichier: FichierBanque): Question[] {
  return fichier.questions.map((q) => ({ ...q, source: 'local', categorie: fichier.categorie }));
}

let base: Question[] | null = null;

/** Questions des fichiers JSON, telles qu'elles sont dans le dépôt. */
export function banqueFichiers(): Question[] {
  base ??= Object.values(fichiers).flatMap(normaliserFichierLocal);
  return base;
}

export type CalqueAdmin = { ajoutees: Question[]; modifiees: Record<string, Question>; supprimees: string[] };

/** Applique les modifications de l'espace admin (ajouts, modifications, suppressions) aux fichiers. */
export function appliquerCalque(fichiersBase: Question[], calque: CalqueAdmin): Question[] {
  const supprimees = new Set(calque.supprimees);
  return [
    ...fichiersBase.filter((q) => !supprimees.has(q.id)).map((q) => calque.modifiees[q.id] ?? q),
    ...calque.ajoutees.filter((q) => !supprimees.has(q.id)),
  ];
}

let calqueCourant: CalqueAdmin = { ajoutees: [], modifiees: {}, supprimees: [] };
let cache: Question[] | null = null;

/** Branche le calque de l'espace admin (appelé par le store admin à chaque modification). */
export function definirCalqueAdmin(calque: CalqueAdmin) {
  calqueCourant = calque;
  cache = null;
}

/** Toutes les questions de la banque locale, modifications de l'admin comprises. */
export function banqueLocale(): Question[] {
  cache ??= appliquerCalque(banqueFichiers(), calqueCourant);
  return cache;
}

export const fournisseurLocal: FournisseurQuestions = {
  id: 'local',
  nom: 'Banque locale QuizMania',
  categories: CATEGORIES,
  actifParDefaut: true,
  horsLigne: true,
  partMax: 1,
  estDisponible: () => true,
  async recuperer(c: CriteresRecuperation) {
    const toutes = banqueLocale();
    return c.categorie === 'mix' ? toutes : toutes.filter((q) => q.categorie === c.categorie);
  },
};
