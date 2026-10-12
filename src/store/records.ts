import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { stockageJSON } from '@/lib/stockage';

/** Nombre de questions mémorisées pour éviter les répétitions. */
const MEMOIRE_QUESTIONS_VUES = 300;

type EtatRecords = {
  /** Meilleur score par clé « mode:categorie:difficulte:nombre ». */
  records: Record<string, number>;
  /** Ids des questions vues récemment (les plus récentes à la fin). */
  vues: string[];
  /** Enregistre un score ; renvoie true s'il bat le record précédent. */
  enregistrerScore: (cle: string, score: number) => boolean;
  marquerVues: (ids: string[]) => void;
};

export function cleRecord(mode: string, categorie: string, difficulte: string, nombre: number): string {
  return `${mode}:${categorie}:${difficulte}:${nombre}`;
}

export const useRecords = create<EtatRecords>()(
  persist(
    (set, get) => ({
      records: {},
      vues: [],
      enregistrerScore: (cle, score) => {
        const precedent = get().records[cle];
        const record = score > 0 && (precedent === undefined || score > precedent);
        if (record) set({ records: { ...get().records, [cle]: score } });
        return record;
      },
      marquerVues: (ids) => {
        const deja = new Set(ids);
        set({ vues: [...get().vues.filter((id) => !deja.has(id)), ...ids].slice(-MEMOIRE_QUESTIONS_VUES) });
      },
    }),
    { name: 'quizmania-records', storage: stockageJSON, version: 1 },
  ),
);
