import type { Question } from '@/types/question';
import { rngAleatoire } from '@/engine/random';
import { normaliserTexte } from '@/engine/texte';
import { lireCache, ecrireCache, UN_JOUR } from './cache';
import { genreAuHasard, questionChanson, tirerChansons, type Chanson, type Epoque, type Style } from './generateurs/blindtest';
import { jsonp } from './reseau';
import type { FournisseurQuestions } from './types';

const API = 'https://api.deezer.com';
const chargerChansons = async () => (await import('@/data/blindtest.json')).default as Chanson[];

export type PisteDeezer = {
  id: number;
  title: string;
  title_short?: string;
  preview: string;
  readable?: boolean;
  artist: { name: string };
};

/** Mots qui signalent une version à éviter (live, remix…). */
const VERSIONS_A_EVITER = /\b(live|remix|version|karaoke|instrumental|cover|reprise|acoustique|edit\b.*mix)\b/i;

/**
 * Choisit, parmi les résultats de recherche Deezer, la piste qui correspond à la chanson :
 * même interprète, titre identique (sans accents ni ponctuation), et pas une version live ou remix.
 */
export function choisirPiste(c: Chanson, pistes: PisteDeezer[]): PisteDeezer | undefined {
  const artiste = normaliserTexte(c.artiste);
  const titre = normaliserTexte(c.titre);
  const candidates = pistes.filter(
    (p) => p.preview && p.readable !== false && normaliserTexte(p.artist.name).includes(artiste.split(' ')[0] ?? artiste),
  );
  const exacte = candidates.find((p) => normaliserTexte(p.title_short ?? p.title) === titre && !VERSIONS_A_EVITER.test(p.title));
  return exacte ?? candidates.find((p) => normaliserTexte(p.title).startsWith(titre) && !VERSIONS_A_EVITER.test(p.title));
}

const cleCache = (c: Chanson) => `deezer-piste:${c.artiste}:${c.titre}`;

/** Retrouve l'extrait officiel d'une chanson (identifiant de piste mis en cache 30 jours). */
async function extrait(c: Chanson): Promise<{ id: number; preview: string } | null> {
  const id = await lireCache<number>(cleCache(c));
  if (id) {
    const frais = await previewPiste(id);
    if (frais) return { id, preview: frais };
  }
  const q = encodeURIComponent(`${c.artiste} ${c.titre}`);
  const r = await jsonp<{ data?: PisteDeezer[] }>(`${API}/search?q=${q}&limit=10`);
  const piste = choisirPiste(c, r.data ?? []);
  if (!piste) return null;
  await ecrireCache(cleCache(c), piste.id, 30 * UN_JOUR);
  return { id: piste.id, preview: piste.preview };
}

/** Les liens d'extraits expirent au bout d'environ 15 minutes : on en redemande un frais. */
async function previewPiste(id: number): Promise<string | null> {
  try {
    const p = await jsonp<PisteDeezer>(`${API}/track/${id}`);
    return p.preview || null;
  } catch {
    return null;
  }
}

/** Identifiant de piste Deezer contenu dans l'id d'une question (« deezer-123-titre »). */
export function idPisteDepuisQuestion(q: Question): number | null {
  const m = q.id.match(/^deezer-(\d+)-/);
  return m ? Number(m[1]) : null;
}

/** Génère des questions de blind test (filtre optionnel par époque ou style). */
export async function questionsBlindTest(nombre: number, filtre?: { epoque?: Epoque; style?: Style }): Promise<Question[]> {
  const rng = rngAleatoire();
  const chansons = await chargerChansons();
  // On en tente un peu plus que nécessaire : certaines chansons peuvent être introuvables.
  const tirees = tirerChansons(chansons, Math.ceil(nombre * 1.4), rng, filtre);
  const extraits = await Promise.allSettled(tirees.map(extrait));
  const questions: Question[] = [];
  extraits.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) questions.push(questionChanson(tirees[i]!, chansons, genreAuHasard(rng), r.value, rng));
  });
  return questions.slice(0, nombre);
}

/**
 * Blind test de chansons françaises : extraits officiels de 30 secondes de l'API publique Deezer.
 * Jamais de paroles : on demande le titre, l'interprète ou l'année.
 */
export const fournisseurDeezer: FournisseurQuestions = {
  id: 'deezer',
  nom: 'Deezer (extraits de 30 s)',
  categories: ['chansons_francaises'],
  actifParDefaut: true,
  horsLigne: false,
  partMax: 0.6,
  estDisponible: () => typeof document !== 'undefined',
  recuperer: (c) => questionsBlindTest(c.nombre),
  async rafraichirMedia(q) {
    const id = idPisteDepuisQuestion(q);
    const preview = id ? await previewPiste(id) : null;
    return preview ? { ...q.media, audio: preview } : null;
  },
};
