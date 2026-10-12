import type { Question } from '@/types/question';
import { dedoublonner } from '@/engine/selection';
import { fournisseurLocal } from './local';
import type { CriteresRecuperation, FournisseurQuestions } from './types';

/** Délai maximal accordé à une source distante avant de basculer sur la banque locale. */
export const DELAI_FOURNISSEUR_MS = 4000;

/** Liste des sources. Ajouter un fournisseur = l'importer et l'ajouter ici. */
export const FOURNISSEURS: FournisseurQuestions[] = [fournisseurLocal];

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
  fournisseurs: FournisseurQuestions[] = FOURNISSEURS,
): Promise<Question[]> {
  const actifs = fournisseurs.filter(
    (f) =>
      f.actifParDefaut &&
      f.estDisponible() &&
      (criteres.categorie === 'mix' || f.categories.includes(criteres.categorie)),
  );
  const resultats = await Promise.allSettled(
    actifs.map((f) => {
      const controleur = new AbortController();
      const promesse = f.recuperer({ ...criteres, signal: controleur.signal });
      return f.horsLigne ? promesse : avecDelai(promesse, DELAI_FOURNISSEUR_MS, controleur);
    }),
  );
  const questions = resultats.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  if (questions.length === 0 && !actifs.includes(fournisseurLocal)) {
    return dedoublonner(await fournisseurLocal.recuperer(criteres));
  }
  return dedoublonner(questions);
}
