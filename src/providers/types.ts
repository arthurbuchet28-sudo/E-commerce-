import type { Categorie, CategorieJeu, NiveauQuestion, Question } from '@/types/question';

export type CriteresRecuperation = {
  categorie: CategorieJeu;
  niveaux: NiveauQuestion[];
  nombre: number;
  signal?: AbortSignal;
};

/**
 * Un fournisseur (adaptateur) de questions.
 * Chaque source renvoie des questions au format normalisé `Question` :
 * le moteur de jeu ne dépend jamais d'une source précise.
 */
export interface FournisseurQuestions {
  /** Identifiant court, recopié dans `Question.source`. */
  readonly id: string;
  readonly nom: string;
  /** Catégories que ce fournisseur sait alimenter. */
  readonly categories: readonly Categorie[];
  /** Activé sans action de l'utilisateur. */
  readonly actifParDefaut: boolean;
  /** Fonctionne sans réseau. */
  readonly horsLigne: boolean;
  /** Prêt à servir (clé API présente, etc.). */
  estDisponible(): boolean;
  recuperer(criteres: CriteresRecuperation): Promise<Question[]>;
}
