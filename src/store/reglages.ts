import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChoixDifficulte } from '@/config/difficulte';
import type { CategorieJeu } from '@/types/question';
import { stockageJSON } from '@/lib/stockage';

export type Theme = 'systeme' | 'clair' | 'sombre';

type EtatReglages = {
  theme: Theme;
  animationsReduites: boolean;
  vibrations: boolean;
  derniereCategorie: CategorieJeu;
  derniereDifficulte: ChoixDifficulte;
  dernierNombre: number;
  derniersJoueurs: string[];
  dernierParJoueur: number;
  /** Blind test : « epoque:80 », « style:rap » ou '' pour tout. */
  dernierFiltre: string;
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
      derniersJoueurs: ['Joueur 1', 'Joueur 2'],
      dernierParJoueur: 5,
      dernierFiltre: '',
      modifier: (r) => set(r),
    }),
    {
      name: 'quizmania-reglages',
      storage: stockageJSON,
      version: 2,
      migrate: (etat) => ({ derniersJoueurs: ['Joueur 1', 'Joueur 2'], dernierParJoueur: 5, dernierFiltre: '', ...(etat as object) }) as EtatReglages,
    },
  ),
);
