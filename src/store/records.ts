import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { stockageJSON } from '@/lib/stockage';

/** Nombre de questions mémorisées pour éviter les répétitions. */
const MEMOIRE_QUESTIONS_VUES = 300;

export type ResultatDefi = { score: number; bonnes: number; total: number; grille: string };

type EtatRecords = {
  /** Meilleur score par clé (voir `cleRecord`). */
  records: Record<string, number>;
  /** Ids des questions vues récemment (les plus récentes à la fin). */
  vues: string[];
  /** Défis du jour joués, par date AAAA-MM-JJ. */
  defis: Record<string, ResultatDefi>;
  /** Enregistre un score ; renvoie true s'il bat le record précédent. */
  enregistrerScore: (cle: string, score: number) => boolean;
  marquerVues: (ids: string[]) => void;
  enregistrerDefi: (jour: string, r: ResultatDefi) => void;
};

/** Clé de record : par mode, catégorie (ou filtre), difficulté et nombre de questions. */
export function cleRecord(...parties: (string | number | undefined)[]): string {
  return parties.filter((p) => p !== undefined && p !== '').join(':');
}

export const useRecords = create<EtatRecords>()(
  persist(
    (set, get) => ({
      records: {},
      vues: [],
      defis: {},
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
      enregistrerDefi: (jour, r) => {
        // Un seul essai par jour : le premier résultat est conservé.
        if (get().defis[jour]) return;
        set({ defis: { ...get().defis, [jour]: r } });
      },
    }),
    { name: 'quizmania-records', storage: stockageJSON, version: 2, migrate: (etat) => ({ defis: {}, ...(etat as object) }) as EtatRecords },
  ),
);
