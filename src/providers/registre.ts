import type { Question } from '@/types/question';
import { dedoublonner } from '@/engine/selection';
import { fournisseurLocal } from './local';
import { enLigne } from './reseau';
import type { CriteresRecuperation, FournisseurQuestions } from './types';

/** Délai maximal accordé à une source distante avant de basculer sur la banque locale. */
export const DELAI_FOURNISSEUR_MS = 4000;

const sources: FournisseurQuestions[] = [fournisseurLocal];

/** Liste des sources actives. Ajouter un fournisseur = l'enregistrer (voir src/providers/index.ts). */
export const FOURNISSEURS: readonly FournisseurQuestions[] = sources;

export function enregistrerFournisseur(f: FournisseurQuestions) {
  if (!sources.some((s) => s.id === f.id)) sources.push(f);
}

export function avecDelai<T>(promesse: Promise<T>, ms: number, controleur?: AbortController): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const minuteur = setTimeout(() => {
      controleur?.abort();
      reject(new Error(`Délai dépassé (${ms} ms)`));
    }, ms);
    promesse.then(
      (v) => {
        clearTimeout(minuteur);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(minuteur);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

/**
 * Récupère des questions auprès de toutes les sources actives qui couvrent la catégorie.
 * Une source en échec ou trop lente est ignorée silencieusement : la banque locale sert de filet.
 */
export async function recupererQuestions(
  criteres: CriteresRecuperation,
  fournisseurs: readonly FournisseurQuestions[] = FOURNISSEURS,
): Promise<Question[]> {
  const enReseau = enLigne();
  const actifs = fournisseurs.filter(
    (f) =>
      f.actifParDefaut &&
      f.estDisponible() &&
      (f.horsLigne || enReseau) &&
      (criteres.categorie === 'mix' || f.categories.includes(criteres.categorie)),
  );
  const resultats = await Promise.allSettled(
    actifs.map(async (f) => {
      const controleur = new AbortController();
      const nombre = Math.max(1, Math.ceil(criteres.nombre * f.partMax));
      // Les sources générées en produisent davantage, pour garder celles du bon niveau.
      const demande = f.partMax < 1 ? nombre * 3 : nombre;
      const promesse = f.recuperer({ ...criteres, nombre: demande, signal: controleur.signal });
      const questions = f.horsLigne ? await promesse : await avecDelai(promesse, DELAI_FOURNISSEUR_MS, controleur);
      if (f.partMax >= 1) return questions;
      const ecart = (q: Question) => Math.min(...criteres.niveaux.map((n) => Math.abs(n - q.difficulte)));
      return [...questions].sort((a, b) => ecart(a) - ecart(b)).slice(0, nombre);
    }),
  );
  const questions = resultats.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  if (questions.length === 0 && !actifs.includes(fournisseurLocal)) {
    return dedoublonner(await fournisseurLocal.recuperer(criteres));
  }
  return dedoublonner(questions);
}

/** Renouvelle le média d'une question auprès de sa source (lien expiré…). */
export async function rafraichirMedia(question: Question): Promise<Question['media'] | null> {
  const f = FOURNISSEURS.find((s) => s.id === question.source);
  if (!f?.rafraichirMedia) return null;
  try {
    return await f.rafraichirMedia(question);
  } catch {
    return null;
  }
}
