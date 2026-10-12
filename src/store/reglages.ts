import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NiveauDifficulte } from '@/config/difficulte';
import type { CategorieJeu } from '@/types/question';
import { stockageJSON } from '@/lib/stockage';

export type Theme = 'systeme' | 'clair' | 'sombre';

type EtatReglages = {
  theme: Theme;
  animationsReduites: boolean;
  vibrations: boolean;
  derniereCategorie: CategorieJeu;
  derniereDifficulte: NiveauDifficulte;
  dernierNombre: number;
  modifier: (r: Partial<Omit<EtatReglages, 'modifier'>>) => void;
};

export const useReglages = create<EtatReglages>()(
  persist(
    (set) => ({
      theme: 'systeme',
      animationsReduites: false,
      vibrations: true,
      derniereCategorie: 'mix',
      derniereDifficulte: 'moyen',
      dernierNombre: 10,
      modifier: (r) => set(r),
    }),
    { name: 'quizmania-reglages', storage: stockageJSON, version: 1 },
  ),
);
