import type { Categorie, NiveauQuestion, Question } from '@/types/question';
import { recupererJson } from './reseau';
import type { FournisseurQuestions } from './types';

/**
 * OpenQuizzDB (openquizzdb.org) : base de quiz francophone, accès par clé API.
 * Sans `VITE_OPENQUIZZDB_KEY`, le fournisseur reste inactif.
 */
const CLE = import.meta.env.VITE_OPENQUIZZDB_KEY as string | undefined;
const API = 'https://api.openquizzdb.org/';

export type ResultatOpenQuizzDb = {
  categorie?: string;
  theme?: string;
  difficulte?: string;
  question?: string;
  reponse_correcte?: string;
  autres_choix?: string[];
  anecdote?: string;
};

/** Correspondance (approximative, par mots-clés) des catégories OpenQuizzDB vers celles du jeu. */
const MOTS_CATEGORIES: [RegExp, Categorie][] = [
  [/musique|chanson/i, 'chansons_francaises'],
  [/cin[ée]ma|s[ée]rie|t[ée]l[ée]/i, 'cinema_series'],
  [/sport|foot|rugby|tennis/i, 'sport'],
  [/histoire/i, 'histoire'],
  [/g[ée]o|pays|capitale|ville/i, 'geographie'],
  [/science|nature|animaux|astronomie/i, 'sciences_nature'],
  [/cuisine|gastronomie|vin|fromage/i, 'gastronomie'],
  [/langue|expression|mot|litt[ée]rature/i, 'langue_francaise'],
  [/jeux? vid[ée]o|manga|bd|bande/i, 'jeux_video_pop'],
  [/c[ée]l[ée]brit|personnalit|people/i, 'personnalites'],
];

export function categorieOpenQuizzDb(r: ResultatOpenQuizzDb): Categorie {
  const texte = `${r.categorie ?? ''} ${r.theme ?? ''}`;
  return MOTS_CATEGORIES.find(([re]) => re.test(texte))?.[1] ?? 'culture_generale';
}

function niveau(difficulte: string | undefined): NiveauQuestion {
  if (/expert/i.test(difficulte ?? '')) return 3;
  if (/confirm/i.test(difficulte ?? '')) return 2;
  return 1;
}

export function normaliserOpenQuizzDb(json: unknown): Question[] {
  const resultats = (json as { results?: ResultatOpenQuizzDb[] })?.results ?? [];
  return resultats.flatMap((r, i) => {
    if (!r.question || !r.reponse_correcte) return [];
    const choix = [...new Set([r.reponse_correcte, ...(r.autres_choix ?? [])])];
    if (choix.length < 2) return [];
    return [
      {
        id: `oqdb-${r.question.length}-${i}-${r.reponse_correcte.slice(0, 12)}`,
        source: 'openquizzdb',
        categorie: categorieOpenQuizzDb(r),
        type: 'qcm' as const,
        difficulte: niveau(r.difficulte),
        enonce: r.question.trim(),
        choix,
        bonneReponse: r.reponse_correcte,
        anecdote: r.anecdote?.trim() || undefined,
      },
    ];
  });
}

export const fournisseurOpenQuizzDb: FournisseurQuestions = {
  id: 'openquizzdb',
  nom: 'OpenQuizzDB',
  categories: ['culture_generale', 'histoire', 'geographie', 'cinema_series', 'sport', 'sciences_nature', 'gastronomie', 'langue_francaise', 'jeux_video_pop', 'personnalites'],
  actifParDefaut: true,
  horsLigne: false,
  partMax: 0.4,
  estDisponible: () => !!CLE,
  async recuperer(c) {
    const json = await recupererJson<unknown>(`${API}?key=${encodeURIComponent(CLE ?? '')}&lang=fr&anec=1&nb=${c.nombre}`, { signal: c.signal });
    const questions = normaliserOpenQuizzDb(json);
    return c.categorie === 'mix' ? questions : questions.filter((q) => q.categorie === c.categorie);
  },
};
