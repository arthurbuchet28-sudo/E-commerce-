import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { REVISION } from '@/config/modes';
import type { Question } from '@/types/question';
import { stockageJSON } from '@/lib/stockage';

type EtatRevision = {
  /** Questions ratées, de la plus ancienne à la plus récente. */
  questions: Question[];
  ajouter: (qs: Question[]) => void;
  retirer: (ids: string[]) => void;
};

/** Questions ratées à revoir (conservées sur l'appareil). */
export const useRevision = create<EtatRevision>()(
  persist(
    (set, get) => ({
      questions: [],
      ajouter: (qs) => {
        const nouvelles = new Set(qs.map((q) => q.id));
        set({ questions: [...get().questions.filter((q) => !nouvelles.has(q.id)), ...qs].slice(-REVISION.maximum) });
      },
      retirer: (ids) => {
        const corrigees = new Set(ids);
        set({ questions: get().questions.filter((q) => !corrigees.has(q.id)) });
      },
    }),
    { name: 'quizmania-revision', storage: stockageJSON, version: 1 },
  ),
);
