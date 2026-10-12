import type { Categorie, CategorieJeu } from '@/types/question';

export type InfoCategorie = {
  id: CategorieJeu;
  nom: string;
  icone: string;
  /** Classes Tailwind du dégradé de la carte. */
  degrade: string;
  /** Couleur principale (hex), utilisée pour les accents. */
  couleur: string;
  accroche: string;
};

export const INFOS_CATEGORIES: Record<CategorieJeu, InfoCategorie> = {
  culture_generale: { id: 'culture_generale', nom: 'Culture générale', icone: '🧠', degrade: 'from-violet-500 to-fuchsia-500', couleur: '#8b5cf6', accroche: 'Un peu de tout, beaucoup de fun' },
  personnalites: { id: 'personnalites', nom: 'Personnalités célèbres', icone: '⭐', degrade: 'from-amber-500 to-orange-600', couleur: '#f59e0b', accroche: 'Stars, génies et légendes' },
  chansons_francaises: { id: 'chansons_francaises', nom: 'Chansons françaises', icone: '🎤', degrade: 'from-pink-500 to-rose-500', couleur: '#ec4899', accroche: 'Le blind test de la chanson' },
  histoire: { id: 'histoire', nom: 'Histoire', icone: '🏰', degrade: 'from-yellow-600 to-amber-700', couleur: '#b45309', accroche: 'De la France et du monde' },
  geographie: { id: 'geographie', nom: 'Géographie', icone: '🌍', degrade: 'from-emerald-600 to-teal-700', couleur: '#10b981', accroche: 'Drapeaux, capitales, régions' },
  cinema_series: { id: 'cinema_series', nom: 'Cinéma et séries', icone: '🎬', degrade: 'from-red-500 to-rose-700', couleur: '#ef4444', accroche: 'Silence… action !' },
  sport: { id: 'sport', nom: 'Sport', icone: '⚽', degrade: 'from-green-600 to-emerald-700', couleur: '#65a30d', accroche: 'Champions et records' },
  sciences_nature: { id: 'sciences_nature', nom: 'Sciences et nature', icone: '🔬', degrade: 'from-cyan-600 to-sky-700', couleur: '#06b6d4', accroche: 'Atomes, étoiles et animaux' },
  gastronomie: { id: 'gastronomie', nom: 'Gastronomie et terroirs', icone: '🧀', degrade: 'from-orange-500 to-red-600', couleur: '#f97316', accroche: 'À table !' },
  langue_francaise: { id: 'langue_francaise', nom: 'Expressions et langue', icone: '📚', degrade: 'from-indigo-500 to-blue-600', couleur: '#6366f1', accroche: 'La langue de Molière' },
  nostalgie: { id: 'nostalgie', nom: 'Années 80 / 90 / 2000', icone: '📼', degrade: 'from-fuchsia-500 to-purple-700', couleur: '#c026d3', accroche: 'Souvenirs, souvenirs' },
  jeux_video_pop: { id: 'jeux_video_pop', nom: 'Jeux vidéo et pop culture', icone: '🎮', degrade: 'from-blue-500 to-violet-600', couleur: '#3b82f6', accroche: 'Game on !' },
  mix: { id: 'mix', nom: 'Mix aléatoire', icone: '🎲', degrade: 'from-pink-600 via-orange-500 to-cyan-600', couleur: '#facc15', accroche: 'Toutes catégories confondues' },
};

export const LISTE_CATEGORIES_JEU: InfoCategorie[] = Object.values(INFOS_CATEGORIES);

export function infoCategorie(id: CategorieJeu | Categorie): InfoCategorie {
  return INFOS_CATEGORIES[id];
}
