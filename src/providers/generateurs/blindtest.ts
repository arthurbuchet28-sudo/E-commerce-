import type { Question } from '@/types/question';
import { melanger, piocher, type Rng } from '@/engine/random';
import { anneesProches, distracteursCredibles } from './outils';

export type Epoque = '60-70' | '80' | '90' | '2000' | 'actuel';
export type Style = 'variete' | 'rap' | 'rock';

export type Chanson = { artiste: string; titre: string; annee: number; epoque: Epoque; style: Style };

export const LIBELLES_EPOQUES: Record<Epoque, string> = {
  '60-70': 'Années 60-70',
  '80': 'Années 80',
  '90': 'Années 90',
  '2000': 'Années 2000',
  actuel: 'Actuelles',
};
export const LIBELLES_STYLES: Record<Style, string> = { variete: 'Variété', rap: 'Rap français', rock: 'Rock français' };

export type GenreQuestionChanson = 'artiste' | 'titre' | 'annee';

/** Ressemblance : même époque, même style. */
function proche(c: Chanson) {
  return (x: Chanson) => (x.epoque === c.epoque ? 3 : 0) + (x.style === c.style ? 2 : 0) + Math.max(0, 2 - Math.abs(x.annee - c.annee) / 5);
}

/**
 * Question de blind test. Aucune parole n'est jamais affichée :
 * on ne demande que le titre, l'interprète ou l'année, à partir de l'extrait officiel.
 */
export function questionChanson(
  c: Chanson,
  toutes: readonly Chanson[],
  genre: GenreQuestionChanson,
  extrait: { id: number; preview: string },
  rng: Rng,
): Question {
  const autres = toutes.filter((x) => x !== c);
  const base = {
    source: 'deezer',
    categorie: 'chansons_francaises' as const,
    type: 'audio' as const,
    media: { audio: extrait.preview, credit: 'Extrait audio fourni par Deezer' },
    anecdote: `« ${c.titre} » — ${c.artiste} (${c.annee}).`,
  };
  const id = `deezer-${extrait.id}-${genre}`;
  switch (genre) {
    case 'artiste': {
      const artistes = autres.filter((x) => x.artiste !== c.artiste);
      return {
        ...base,
        id,
        difficulte: c.epoque === 'actuel' || c.epoque === '2000' ? 1 : 2,
        enonce: 'Qui interprète cette chanson ?',
        choix: [c.artiste, ...distracteursCredibles(c, artistes, 5, proche(c), (x) => x.artiste, rng)],
        bonneReponse: c.artiste,
        reponsesAcceptees: [],
      };
    }
    case 'titre':
      return {
        ...base,
        id,
        difficulte: c.epoque === '60-70' ? 3 : 2,
        enonce: 'Quel est le titre de cette chanson ?',
        choix: [c.titre, ...distracteursCredibles(c, autres, 5, proche(c), (x) => x.titre, rng)],
        bonneReponse: c.titre,
        reponsesAcceptees: [],
      };
    case 'annee':
      return {
        ...base,
        id,
        difficulte: c.epoque === 'actuel' ? 3 : 4,
        enonce: `En quelle année est sortie cette chanson de ${c.artiste} ?`,
        choix: [String(c.annee), ...anneesProches(c.annee, 5, rng, 3)],
        bonneReponse: String(c.annee),
      };
  }
}

/** Tire des chansons au hasard (filtre optionnel par époque / style). */
export function tirerChansons(toutes: readonly Chanson[], nombre: number, rng: Rng, filtre?: { epoque?: Epoque; style?: Style }): Chanson[] {
  const vivier = toutes.filter((c) => (!filtre?.epoque || c.epoque === filtre.epoque) && (!filtre?.style || c.style === filtre.style));
  return melanger(vivier, rng).slice(0, nombre);
}

export function genreAuHasard(rng: Rng): GenreQuestionChanson {
  return piocher(['artiste', 'artiste', 'titre', 'titre', 'annee'] as const, rng);
}
