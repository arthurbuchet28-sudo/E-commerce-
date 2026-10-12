import type { Categorie, NiveauQuestion, Question } from '@/types/question';
import { recupererJson } from './reseau';
import type { FournisseurQuestions } from './types';

/**
 * Open Trivia Database (opentdb.com) : grande base gratuite, mais en anglais.
 * Désactivée par défaut : elle ne s'active que si une fonction de traduction fiable est fournie
 * (voir `definirTraducteur`), et seulement pour les catégories universelles.
 */
export type Traducteur = (textes: string[]) => Promise<string[]>;
let traducteur: Traducteur | null = null;

export function definirTraducteur(t: Traducteur | null) {
  traducteur = t;
}

/** Catégories OpenTDB retenues : sciences et géographie uniquement. */
const CATEGORIES_OTDB: Partial<Record<Categorie, number[]>> = {
  sciences_nature: [17, 19],
  geographie: [22],
};

export type ResultatOpenTdb = {
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const NIVEAUX: Record<ResultatOpenTdb['difficulty'], NiveauQuestion> = { easy: 1, medium: 2, hard: 3 };

/** Normalise une réponse OpenTDB encodée en URL (encode=url3986). Les textes restent à traduire. */
export function normaliserOpenTdb(json: unknown, categorie: Categorie): Question[] {
  const resultats = (json as { results?: ResultatOpenTdb[] })?.results ?? [];
  const d = (s: string) => decodeURIComponent(s);
  return resultats.map((r, i) => {
    const bonne = d(r.correct_answer);
    if (r.type === 'boolean') {
      return {
        id: `otdb-${categorie}-${i}-${d(r.question).length}`,
        source: 'opentdb',
        categorie,
        type: 'vrai_faux' as const,
        difficulte: NIVEAUX[r.difficulty] ?? 2,
        enonce: d(r.question),
        choix: ['Vrai', 'Faux'],
        bonneReponse: bonne === 'True' ? 'Vrai' : 'Faux',
      };
    }
    return {
      id: `otdb-${categorie}-${i}-${d(r.question).length}`,
      source: 'opentdb',
      categorie,
      type: 'qcm' as const,
      difficulte: NIVEAUX[r.difficulty] ?? 2,
      enonce: d(r.question),
      choix: [bonne, ...r.incorrect_answers.map(d)],
      bonneReponse: bonne,
    };
  });
}

/** Traduit énoncé, choix et bonne réponse ; écarte la question si la traduction échoue. */
export async function traduireQuestions(questions: Question[], t: Traducteur): Promise<Question[]> {
  const traduites = await Promise.allSettled(
    questions.map(async (q) => {
      if (q.type === 'vrai_faux') {
        const [enonce] = await t([q.enonce]);
        return { ...q, enonce: enonce ?? q.enonce };
      }
      const textes = [q.enonce, ...(q.choix ?? [])];
      const [enonce, ...choix] = await t(textes);
      const indexBonne = (q.choix ?? []).indexOf(String(q.bonneReponse));
      return { ...q, enonce: enonce!, choix, bonneReponse: choix[indexBonne]! };
    }),
  );
  return traduites.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
}

export const fournisseurOpenTdb: FournisseurQuestions = {
  id: 'opentdb',
  nom: 'Open Trivia Database (traduite)',
  categories: ['sciences_nature', 'geographie'],
  actifParDefaut: false,
  horsLigne: false,
  partMax: 0.3,
  estDisponible: () => traducteur !== null,
  async recuperer(c) {
    if (!traducteur) return [];
    const cats = c.categorie === 'mix' ? Object.entries(CATEGORIES_OTDB) : [[c.categorie, CATEGORIES_OTDB[c.categorie]]];
    const questions: Question[] = [];
    for (const [cat, ids] of cats as [Categorie, number[] | undefined][]) {
      if (!ids?.length) continue;
      const id = ids[Math.floor(Math.random() * ids.length)];
      const json = await recupererJson<unknown>(`https://opentdb.com/api.php?amount=${c.nombre}&category=${id}&encode=url3986`, { signal: c.signal });
      questions.push(...normaliserOpenTdb(json, cat));
    }
    return traduireQuestions(questions, traducteur);
  },
};
