import { createStore, del, get, set } from 'idb-keyval';

/**
 * Cache des données récupérées (IndexedDB via idb-keyval), avec durée de vie.
 * Si IndexedDB est indisponible (navigation privée, tests), on se rabat sur la mémoire.
 */
type Entree<T> = { valeur: T; expire: number };

const memoire = new Map<string, Entree<unknown>>();
let store: ReturnType<typeof createStore> | null | undefined;

function magasin() {
  if (store !== undefined) return store;
  try {
    store = typeof indexedDB === 'undefined' ? null : createStore('quizmania', 'cache');
  } catch {
    store = null;
  }
  return store;
}

export const UN_JOUR = 24 * 60 * 60 * 1000;

export async function lireCache<T>(cle: string): Promise<T | undefined> {
  let entree = memoire.get(cle) as Entree<T> | undefined;
  const s = magasin();
  if (!entree && s) {
    try {
      entree = await get<Entree<T>>(cle, s);
    } catch {
      /* ignoré */
    }
  }
  if (!entree) return undefined;
  if (entree.expire < Date.now()) {
    memoire.delete(cle);
    if (s) void del(cle, s).catch(() => {});
    return undefined;
  }
  memoire.set(cle, entree);
  return entree.valeur;
}

export async function ecrireCache<T>(cle: string, valeur: T, dureeMs: number): Promise<void> {
  const entree: Entree<T> = { valeur, expire: Date.now() + dureeMs };
  memoire.set(cle, entree);
  const s = magasin();
  if (s) {
    try {
      await set(cle, entree, s);
    } catch {
      /* ignoré */
    }
  }
}

/** Renvoie la valeur en cache, ou la calcule et la met en cache. */
export async function avecCache<T>(cle: string, dureeMs: number, calcul: () => Promise<T>): Promise<T> {
  const enCache = await lireCache<T>(cle);
  if (enCache !== undefined) return enCache;
  const valeur = await calcul();
  await ecrireCache(cle, valeur, dureeMs);
  return valeur;
}

/** Pour les tests. */
export function viderCacheMemoire() {
  memoire.clear();
}
