import type { Route } from "next";

/**
 * The 8 steps of the « Se lancer » path. Titles only for now: objectives, durations,
 * deliverables and checklists are added in phase 5.
 */
export const parcoursSteps = [
  { slug: "trouver-son-idee", title: "Trouver son idée et son modèle" },
  { slug: "valider-le-marche", title: "Valider le marché" },
  { slug: "choisir-son-statut", title: "Choisir son statut et créer son entreprise" },
  { slug: "se-mettre-en-conformite", title: "Se mettre en conformité" },
  { slug: "creer-sa-boutique", title: "Choisir sa plateforme et créer sa boutique" },
  { slug: "paiement-livraison-retours", title: "Paiement, livraison, retours, service client" },
  { slug: "attirer-ses-premiers-clients", title: "Attirer ses premiers clients" },
  { slug: "piloter-et-rentabiliser", title: "Piloter et rentabiliser" },
] as const;

export type ParcoursStep = (typeof parcoursSteps)[number];

export function findStep(slug: string) {
  const index = parcoursSteps.findIndex((s) => s.slug === slug);
  return index === -1 ? null : { ...parcoursSteps[index], number: index + 1 };
}

export function stepHref(slug: string): Route {
  return `/se-lancer/${slug}` as Route;
}
