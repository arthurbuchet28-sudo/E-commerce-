import type { NiveauQuestion } from '@/types/question';
import { melanger, type Rng } from '@/engine/random';
import { normaliserTexte } from '@/engine/texte';

/**
 * Choisit des mauvaises réponses crédibles : on classe les candidats par ressemblance
 * avec la bonne réponse (même époque, même pays, même domaine…) et on garde les plus proches.
 * Le mélange initial départage les ex-æquo, ce qui varie les choix d'une partie à l'autre.
 */
export function distracteursCredibles<T>(
  cible: T,
  candidats: readonly T[],
  nombre: number,
  ressemblance: (candidat: T) => number,
  libelle: (x: T) => string,
  rng: Rng,
): string[] {
  const bonne = normaliserTexte(libelle(cible));
  const vus = new Set([bonne]);
  const classes = melanger(candidats, rng)
    .map((c) => ({ c, score: ressemblance(c) }))
    .sort((a, b) => b.score - a.score);
  const vivier: string[] = [];
  for (const { c } of classes) {
    const l = libelle(c);
    const n = normaliserTexte(l);
    if (!l || vus.has(n)) continue;
    vus.add(n);
    vivier.push(l);
    if (vivier.length >= nombre) break;
  }
  return vivier;
}

/** Niveau 1 → 4 selon le rang de notoriété (0 = le plus connu), avec un décalage selon le type de question. */
export function niveauSelonRang(rang: number, total: number, decalage = 0): NiveauQuestion {
  const quart = total > 0 ? rang / total : 0;
  const base = quart < 0.25 ? 1 : quart < 0.5 ? 2 : quart < 0.75 ? 3 : 4;
  return Math.min(4, Math.max(1, base + decalage)) as NiveauQuestion;
}

/** Années plausibles autour de la bonne, assez espacées pour qu'il n'y ait pas d'ambiguïté. */
export function anneesProches(annee: number, nombre: number, rng: Rng, ecartMin = 3): string[] {
  const decalages = melanger([-4, -3, -2, -1, 1, 2, 3, 4], rng).slice(0, nombre);
  const pas = ecartMin + Math.floor(rng() * 3);
  return decalages.map((d) => String(annee + d * pas));
}

/** « né » / « née » selon le genre. */
export function accord(genre: 'f' | 'm' | null, masculin: string, feminin: string, neutre = `${masculin}(e)`): string {
  return genre === 'f' ? feminin : genre === 'm' ? masculin : neutre;
}

/** Variante de saisie acceptée : le nom de famille seul (« Vinci », « Curie »…). */
export function variantesNom(nom: string): string[] {
  const mots = nom.split(/\s+/);
  const dernier = mots.at(-1) ?? '';
  return mots.length > 1 && dernier.length > 3 ? [dernier] : [];
}

