import type { Question } from '@/types/question';
import { melanger, rngAleatoire } from '@/engine/random';
import { lireCache, ecrireCache, UN_JOUR } from '../cache';
import { genererQuestionsPersonnes, categoriePersonne } from '../generateurs/personnes';
import { genererQuestionsEvenements, genererQuestionsMonuments } from '../generateurs/monuments-evenements';
import { enLigne, recupererJson } from '../reseau';
import type { FournisseurQuestions } from '../types';
import { normaliserEvenements, requeteEvenements, type Evenement, type LigneSparql, type Monument, type Personne } from './requetes';

// Instantanés chargés à la demande (fichiers séparés du code principal).
const chargerPersonnes = async () => (await import('@/data/generes/personnalites.json')).default as Personne[];
const chargerMonuments = async () => (await import('@/data/generes/monuments.json')).default as Monument[];
const chargerEvenements = async () => (await import('@/data/generes/evenements.json')).default as Evenement[];

const CLE_EVENEMENTS = 'wikidata-evenements';

/**
 * Événements : instantané embarqué, rafraîchi en arrière-plan depuis Wikidata au plus une fois par semaine.
 * (Les personnalités et monuments ont besoin des crédits Commons de chaque photo :
 * ils sont régénérés par le script `npm run data:wikidata`.)
 */
async function evenements(): Promise<Evenement[]> {
  const enCache = await lireCache<Evenement[]>(CLE_EVENEMENTS);
  if (enCache?.length) return enCache;
  if (enLigne()) void rafraichirEvenements();
  return chargerEvenements();
}

let rafraichissement: Promise<void> | null = null;
function rafraichirEvenements(): Promise<void> {
  rafraichissement ??= (async () => {
    try {
      const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(requeteEvenements())}`;
      // « format=json » plutôt qu'un en-tête Accept : requête simple, sans pré-vérification CORS.
      const json = await recupererJson<{ results: { bindings: LigneSparql[] } }>(url, { delaiMs: 30_000 });
      const frais = normaliserEvenements(json.results.bindings);
      if (frais.length > 50) await ecrireCache(CLE_EVENEMENTS, frais, 7 * UN_JOUR);
    } catch {
      /* on garde l'instantané */
    }
  })();
  return rafraichissement;
}

/**
 * Questions générées depuis Wikidata : « Qui est cette personne ? » (photo Wikimedia Commons créditée),
 * année de naissance, pays, domaine ; monuments en photo ; années et chronologies d'événements.
 * Seules les personnes et lieux très connus (beaucoup d'articles Wikipédia) sont retenus.
 */
export const fournisseurWikidata: FournisseurQuestions = {
  id: 'wikidata',
  nom: 'Wikidata et Wikimedia Commons',
  categories: ['personnalites', 'sport', 'cinema_series', 'histoire', 'geographie'],
  actifParDefaut: true,
  // Les questions sans photo restent jouables hors ligne ; les photos sont préchargées
  // et remplacées si elles ne se chargent pas.
  horsLigne: true,
  partMax: 0.5,
  estDisponible: () => true,
  async recuperer(c): Promise<Question[]> {
    const rng = rngAleatoire();
    const [personnes, monuments] = await Promise.all([chargerPersonnes(), chargerMonuments()]);
    const resultat: Question[] = [];
    const veut = (cat: Question['categorie']) => c.categorie === 'mix' || c.categorie === cat;
    if (personnes.some((p) => veut(categoriePersonne(p)))) {
      resultat.push(...genererQuestionsPersonnes(personnes, c.categorie === 'mix' ? 'mix' : c.categorie, c.nombre, rng));
    }
    if (veut('histoire')) resultat.push(...genererQuestionsEvenements(await evenements(), c.nombre, rng));
    if (veut('geographie')) resultat.push(...genererQuestionsMonuments(monuments, Math.ceil(c.nombre / 2), rng));
    const sansReseau = !enLigne();
    return melanger(
      resultat.filter((q) => !(sansReseau && q.media?.image)),
      rng,
    );
  },
};
