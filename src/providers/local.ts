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

let cache: Question[] | null = null;

/** Toutes les questions de la banque locale (chargées une seule fois). */
export function banqueLocale(): Question[] {
  cache ??= Object.values(fichiers).flatMap(normaliserFichierLocal);
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
