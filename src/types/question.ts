export const CATEGORIES = [
  'culture_generale',
  'personnalites',
  'chansons_francaises',
  'histoire',
  'geographie',
  'cinema_series',
  'sport',
  'sciences_nature',
  'gastronomie',
  'langue_francaise',
  'nostalgie',
  'jeux_video_pop',
] as const;

/** Catégorie « réelle » d'une question. */
export type Categorie = (typeof CATEGORIES)[number];
/** Catégorie choisissable pour une partie (inclut le mix). */
export type CategorieJeu = Categorie | 'mix';

export type TypeQuestion =
  | 'qcm'
  | 'vrai_faux'
  | 'saisie'
  | 'image'
  | 'audio'
  | 'chronologie'
  | 'estimation';

export type NiveauQuestion = 1 | 2 | 3 | 4;

export type Question = {
  id: string;
  /** "local", "opentdb", "wikidata", "deezer"... */
  source: string;
  categorie: Categorie;
  type: TypeQuestion;
  /** 1 = facile → 4 = expert */
  difficulte: NiveauQuestion;
  /** Toujours en français. */
  enonce: string;
  choix?: string[];
  bonneReponse: string | string[] | number;
  /** Variantes acceptées pour la saisie libre. */
  reponsesAcceptees?: string[];
  media?: { image?: string; audio?: string; credit?: string; /** Texte alternatif de l'image. */ alt?: string };
  /** Réglages des questions d'estimation (points dégressifs selon l'écart). */
  estimation?: {
    /** Écart au-delà duquel la réponse ne rapporte plus rien. */
    marge: number;
    unite?: string;
    min?: number;
    max?: number;
  };
  /** « Le saviez-vous ? » affiché après la réponse. */
  anecdote?: string;
};
