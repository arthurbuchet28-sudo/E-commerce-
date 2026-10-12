import type { Question } from '@/types/question';
import { rngAleatoire } from '@/engine/random';
import { avecCache, UN_JOUR } from './cache';
import { urlDrapeau } from './drapeaux';
import { genererQuestionsDepartements, genererQuestionsPays, type Departement } from './generateurs/geographie';
import { recupererJson } from './reseau';
import type { FournisseurQuestions } from './types';
import type { Pays } from './wikidata/requetes';

const CLE_RESTCOUNTRIES = import.meta.env.VITE_RESTCOUNTRIES_KEY as string | undefined;
const URL_RESTCOUNTRIES = 'https://api.restcountries.com/countries/v5';

type PaysRestCountries = {
  codes?: { alpha_2?: string };
  population?: number;
  flag?: { url_svg?: string };
  classification?: { sovereign?: boolean };
};

/**
 * Normalise la réponse REST Countries v5 : on n'en garde que la population et le drapeau,
 * car les noms (capitales, monnaies) n'y sont qu'en anglais. Les libellés français viennent de Wikidata.
 */
export function normaliserRestCountries(json: unknown): Map<string, { population?: number; drapeau?: string }> {
  const objets = (json as { data?: { objects?: PaysRestCountries[] } })?.data?.objects ?? [];
  const resultat = new Map<string, { population?: number; drapeau?: string }>();
  for (const o of objets) {
    const iso = o.codes?.alpha_2?.toLowerCase();
    if (!iso) continue;
    resultat.set(iso, {
      population: typeof o.population === 'number' && o.population > 0 ? o.population : undefined,
      drapeau: o.flag?.url_svg,
    });
  }
  return resultat;
}

/** Fusionne les données REST Countries (population récente) dans le jeu de données Wikidata. */
export function enrichirPays(pays: Pays[], complements: Map<string, { population?: number }>): Pays[] {
  return pays.map((p) => {
    const c = complements.get(p.iso2);
    return c?.population ? { ...p, population: c.population } : p;
  });
}

async function chargerPays(): Promise<Pays[]> {
  const base = (await import('@/data/generes/pays.json')).default as Pays[];
  if (!CLE_RESTCOUNTRIES) return base;
  try {
    const complements = await avecCache('restcountries-v5', 7 * UN_JOUR, async () => {
      const json = await recupererJson<unknown>(`${URL_RESTCOUNTRIES}?limit=300`, {
        headers: { Authorization: `Bearer ${CLE_RESTCOUNTRIES}` },
      });
      return [...normaliserRestCountries(json)];
    });
    return enrichirPays(base, new Map(complements));
  } catch {
    return base;
  }
}

/** Pays du monde : drapeaux, capitales, monnaies, populations (Wikidata + REST Countries si clé). */
export const fournisseurPays: FournisseurQuestions = {
  id: 'pays',
  nom: 'Pays du monde (Wikidata, REST Countries)',
  categories: ['geographie'],
  actifParDefaut: true,
  horsLigne: true,
  partMax: 0.35,
  estDisponible: () => true,
  async recuperer(c) {
    const pays = await chargerPays();
    return genererQuestionsPays(pays, c.nombre, rngAleatoire(), urlDrapeau);
  },
};

/** Départements français : préfectures, numéros, régions. */
export const fournisseurDepartements: FournisseurQuestions = {
  id: 'departements',
  nom: 'Départements français',
  categories: ['geographie'],
  actifParDefaut: true,
  horsLigne: true,
  partMax: 0.25,
  estDisponible: () => true,
  async recuperer(c): Promise<Question[]> {
    const departements = (await import('@/data/departements.json')).default as Departement[];
    return genererQuestionsDepartements(departements, c.nombre, rngAleatoire());
  },
};
