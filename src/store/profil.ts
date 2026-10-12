import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BADGES, type Badge } from '@/config/progression';
import type { EtatPartie } from '@/engine/partie';
import {
  STATS_VIDES,
  entreeHistorique,
  majStatistiques,
  niveauDepuisXp,
  nouveauxBadges,
  xpPourPartie,
  type EntreeHistorique,
  type InfoNiveau,
  type Statistiques,
} from '@/engine/progression';
import { stockageJSON } from '@/lib/stockage';

export type StyleAvatar = 'thumbs' | 'lorelei' | 'notionists' | 'bottts-neutral';
export type Avatar = { style: StyleAvatar; graine: string };

/** Ce que la partie a rapporté (affiché sur l'écran de résultats). */
export type BilanProgression = {
  xpGagne: number;
  avant: InfoNiveau;
  apres: InfoNiveau;
  badges: Badge[];
};

const HISTORIQUE_MAX = 200;

type EtatProfil = {
  pseudo: string;
  avatar: Avatar;
  xp: number;
  stats: Statistiques;
  /** Badges obtenus : identifiant → date ISO. */
  badges: Record<string, string>;
  historique: EntreeHistorique[];
  modifier: (p: Partial<Pick<EtatProfil, 'pseudo' | 'avatar'>>) => void;
  enregistrerPartie: (partie: EtatPartie, serieDefi: number, date?: Date) => BilanProgression;
  reinitialiser: () => void;
};

function grainAleatoire() {
  return Math.random().toString(36).slice(2, 10);
}

const initial = () => ({
  pseudo: 'Joueur',
  avatar: { style: 'thumbs' as StyleAvatar, graine: grainAleatoire() },
  xp: 0,
  stats: STATS_VIDES,
  badges: {},
  historique: [],
});

export const useProfil = create<EtatProfil>()(
  persist(
    (set, get) => ({
      ...initial(),
      modifier: (p) => set(p),
      enregistrerPartie: (partie, serieDefi, date = new Date()) => {
        const { xp, stats, badges, historique, pseudo } = get();
        const xpGagne = xpPourPartie(partie);
        const avant = niveauDepuisXp(xp);
        const apres = niveauDepuisXp(xp + xpGagne);
        const nouvellesStats = majStatistiques(stats, partie, date);
        const debloques = nouveauxBadges({ stats: nouvellesStats, niveau: apres.niveau, serieDefi }, Object.keys(badges));
        const quand = date.toISOString();
        set({
          xp: xp + xpGagne,
          stats: nouvellesStats,
          badges: { ...badges, ...Object.fromEntries(debloques.map((b) => [b.id, quand])) },
          historique: [entreeHistorique(partie, pseudo, date), ...historique].slice(0, HISTORIQUE_MAX),
        });
        return { xpGagne, avant, apres, badges: debloques };
      },
      reinitialiser: () => set(initial()),
    }),
    { name: 'quizmania-profil', storage: stockageJSON, version: 1 },
  ),
);

/** Badge par identifiant. */
export function badgeParId(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
