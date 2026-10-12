import { CATEGORIES, type Categorie, type Question } from '@/types/question';
import { cleEnonce } from './texte';

const TYPES = ['qcm', 'vrai_faux', 'saisie', 'image', 'audio', 'chronologie', 'estimation'];

/** Nombre minimal de choix en QCM selon le niveau (l'expert affiche jusqu'à 6 choix). */
export const CHOIX_MIN_PAR_NIVEAU: Record<number, number> = { 1: 4, 2: 4, 3: 6, 4: 6 };

export type ErreurValidation = { id: string; message: string };

/** Valide une question de la banque. Renvoie la liste des problèmes (vide si tout va bien). */
export function validerQuestion(q: Partial<Question>, categorieAttendue?: Categorie): string[] {
  const erreurs: string[] = [];
  if (!q.id || typeof q.id !== 'string') erreurs.push('id manquant');
  if (!q.categorie || !(CATEGORIES as readonly string[]).includes(q.categorie)) {
    erreurs.push(`catégorie inconnue : « ${String(q.categorie)} »`);
  } else if (categorieAttendue && q.categorie !== categorieAttendue) {
    erreurs.push(`catégorie « ${q.categorie} » dans le fichier « ${categorieAttendue} »`);
  }
  if (!q.type || !TYPES.includes(q.type)) erreurs.push(`type inconnu : « ${String(q.type)} »`);
  if (![1, 2, 3, 4].includes(q.difficulte as number)) erreurs.push(`difficulté invalide : ${String(q.difficulte)}`);
  if (!q.enonce || q.enonce.trim().length < 8) erreurs.push('énoncé manquant ou trop court');
  if (!q.anecdote || q.anecdote.trim().length < 10) erreurs.push('anecdote manquante');
  if (q.bonneReponse === undefined || q.bonneReponse === '') erreurs.push('bonne réponse manquante');

  if (q.type === 'qcm' || q.type === 'image' || q.type === 'audio') {
    const choix = q.choix ?? [];
    if (q.type === 'qcm') {
      const min = CHOIX_MIN_PAR_NIVEAU[q.difficulte ?? 1] ?? 4;
      if (choix.length < min) erreurs.push(`${choix.length} choix, ${min} attendus au niveau ${q.difficulte}`);
    }
    if (choix.length && !choix.includes(String(q.bonneReponse))) erreurs.push('la bonne réponse est absente des choix');
    const uniques = new Set(choix.map((c) => c.trim().toLowerCase()));
    if (uniques.size !== choix.length) erreurs.push('choix en double');
  }
  if (q.type === 'vrai_faux') {
    if (JSON.stringify(q.choix) !== JSON.stringify(['Vrai', 'Faux'])) erreurs.push('les choix doivent être ["Vrai", "Faux"]');
    if (q.bonneReponse !== 'Vrai' && q.bonneReponse !== 'Faux') erreurs.push('la bonne réponse doit être « Vrai » ou « Faux »');
  }
  return erreurs;
}

/** Valide une banque entière : erreurs de chaque question + ids et énoncés en double. */
export function validerBanque(questions: Partial<Question>[]): ErreurValidation[] {
  const erreurs: ErreurValidation[] = [];
  const ids = new Map<string, number>();
  const enonces = new Map<string, string>();
  for (const q of questions) {
    const id = q.id ?? '(sans id)';
    for (const message of validerQuestion(q)) erreurs.push({ id, message });
    ids.set(id, (ids.get(id) ?? 0) + 1);
    if (q.enonce) {
      const cle = cleEnonce(q.enonce);
      const autre = enonces.get(cle);
      if (autre) erreurs.push({ id, message: `énoncé en double avec ${autre}` });
      else enonces.set(cle, id);
    }
  }
  for (const [id, n] of ids) if (n > 1) erreurs.push({ id, message: `id utilisé ${n} fois` });
  return erreurs;
}
