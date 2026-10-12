import type { Question } from '@/types/question';
import { formaterNombre } from './evaluation';
import { melanger, type Rng } from './random';

/** Bonne réponse d'une question, sous forme de texte affichable. */
export function bonneReponseTexte(q: Question): string {
  if (Array.isArray(q.bonneReponse)) return q.bonneReponse.join(' → ');
  if (typeof q.bonneReponse === 'number') return formaterNombre(q.bonneReponse) + (q.estimation?.unite ? ` ${q.estimation.unite}` : '');
  return String(q.bonneReponse);
}

/**
 * Prépare les choix affichés : la bonne réponse + (nbChoix - 1) mauvaises,
 * tirées au hasard parmi celles disponibles, puis mélangées.
 * Le Vrai / Faux garde toujours ses 2 choix dans l'ordre.
 */
export function preparerChoix(q: Question, nbChoix: number, rng: Rng): string[] {
  if (q.type === 'vrai_faux') return ['Vrai', 'Faux'];
  const bonne = bonneReponseTexte(q);
  const mauvaises = (q.choix ?? []).filter((c) => c !== bonne);
  const retenues = melanger(mauvaises, rng).slice(0, Math.max(1, nbChoix - 1));
  return melanger([bonne, ...retenues], rng);
}

/** Mélange les éléments d'une chronologie en évitant de les présenter déjà dans l'ordre. */
export function preparerChronologie(bonOrdre: string[], rng: Rng): string[] {
  if (bonOrdre.length < 2) return [...bonOrdre];
  for (let essai = 0; essai < 10; essai++) {
    const m = melanger(bonOrdre, rng);
    if (m.some((e, i) => e !== bonOrdre[i])) return m;
  }
  return [...bonOrdre].reverse();
}

/** Joker 50/50 : renvoie les choix à masquer (la moitié des mauvaises réponses, arrondie au supérieur). */
export function cinquanteCinquante(choix: string[], bonne: string, rng: Rng): string[] {
  const mauvaises = choix.filter((c) => c !== bonne);
  const aMasquer = Math.ceil(mauvaises.length / 2);
  return melanger(mauvaises, rng).slice(0, aMasquer);
}

/** Joker indice : la première lettre et la longueur de la bonne réponse. */
export function indicePremiereLettre(bonne: string): string {
  const premier = bonne.trim().charAt(0).toUpperCase();
  const nbMots = bonne.trim().split(/\s+/).length;
  return `Commence par « ${premier} »` + (nbMots > 1 ? ` (${nbMots} mots)` : '');
}

/** Joker indice pour une estimation : une fourchette qui contient la bonne valeur. */
export function indiceFourchette(bonne: number, marge: number, rng: Rng): string {
  const largeur = Math.max(1, Math.round(marge));
  const debut = Math.round(bonne - rng() * largeur);
  return `Entre ${formaterNombre(debut)} et ${formaterNombre(debut + largeur)}`;
}
