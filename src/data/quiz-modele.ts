import type { Route } from "next";

/**
 * « Quel modèle e-commerce pour moi ? » quiz (tool 4). Scores are editorial weights
 * [À VALIDER]: each answer adds points to the models it suits. No income promise.
 */

export type ModelId = "stock" | "dropshipping" | "pod" | "artisanat" | "revente" | "numerique";

export type EcommerceModel = {
  id: ModelId;
  title: string;
  summary: string;
  advantages: string[];
  risks: string[];
  guide: { title: string; href: Route };
};

const MODELS_GUIDE = {
  title: "Les 6 modèles de e-commerce : lequel choisir selon votre profil",
  href: "/guides/idee-et-produit/les-6-modeles-de-e-commerce" as Route,
};

export const models: Record<ModelId, EcommerceModel> = {
  stock: {
    id: "stock",
    title: "Acheter et stocker des produits",
    summary: "Vous achetez à un fournisseur, stockez et expédiez vous-même.",
    advantages: [
      "Vous maîtrisez la qualité, l’emballage et les délais.",
      "Marge par produit souvent meilleure qu’avec les modèles sans stock.",
    ],
    risks: ["L’argent est immobilisé avant la vente.", "Les invendus sont une perte."],
    guide: MODELS_GUIDE,
  },
  dropshipping: {
    id: "dropshipping",
    title: "Dropshipping",
    summary:
      "Le fournisseur expédie directement au client ; vous gérez la boutique et la relation client.",
    advantages: ["Peu d’argent immobilisé au départ.", "Pas de stock ni de colis à préparer."],
    risks: [
      "Vous restez responsable de la commande vis-à-vis du client.",
      "Qualité et délais difficiles à contrôler, concurrence forte sur les mêmes produits.",
    ],
    guide: MODELS_GUIDE,
  },
  pod: {
    id: "pod",
    title: "Print-on-demand",
    summary: "Vous créez les visuels ; un prestataire fabrique chaque produit à la commande.",
    advantages: ["Pas de stock.", "Adapté à une identité graphique ou à une communauté."],
    risks: ["Marge unitaire plus faible.", "Délais de fabrication et d’expédition plus longs."],
    guide: MODELS_GUIDE,
  },
  artisanat: {
    id: "artisanat",
    title: "Artisanat",
    summary: "Vous fabriquez vous-même ce que vous vendez.",
    advantages: [
      "Un produit qui vous distingue de la concurrence.",
      "Des clients attachés à votre savoir-faire.",
    ],
    risks: [
      "Votre temps limite le volume.",
      "Un prix qui oublie vos heures vous fait travailler à perte.",
    ],
    guide: MODELS_GUIDE,
  },
  revente: {
    id: "revente",
    title: "Revente et seconde main",
    summary: "Vous achetez pour revendre : invendus, lots, objets d’occasion.",
    advantages: [
      "Démarrage possible avec un petit budget.",
      "Une demande croissante pour la seconde main.",
    ],
    risks: ["Approvisionnement irrégulier.", "Chaque pièce demande photos et description."],
    guide: MODELS_GUIDE,
  },
  numerique: {
    id: "numerique",
    title: "Produits numériques",
    summary: "Modèles, fichiers, formations : créés une fois, vendus sans stock ni expédition.",
    advantages: ["Ni stock, ni colis.", "Valorise une expertise que vous avez déjà."],
    risks: [
      "Beaucoup de travail avant la première vente.",
      "Visibilité à construire, copie possible.",
    ],
    guide: MODELS_GUIDE,
  },
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: Array<{ id: string; label: string; scores: Partial<Record<ModelId, number>> }>;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "budget",
    text: "Quel budget pouvez-vous engager, et perdre si le test échoue ?",
    options: [
      {
        id: "tres-faible",
        label: "Presque rien",
        scores: { pod: 2, numerique: 2, dropshipping: 1, revente: 1 },
      },
      {
        id: "faible",
        label: "Quelques centaines d’euros",
        scores: { revente: 2, artisanat: 2, pod: 1, dropshipping: 1 },
      },
      {
        id: "moyen",
        label: "Quelques milliers d’euros",
        scores: { stock: 2, revente: 1, artisanat: 1 },
      },
    ],
  },
  {
    id: "temps",
    text: "Combien de temps pouvez-vous y consacrer chaque semaine, durablement ?",
    options: [
      { id: "peu", label: "Quelques heures", scores: { pod: 2, numerique: 1, dropshipping: 1 } },
      {
        id: "moyen",
        label: "Une à deux soirées et le week-end",
        scores: { revente: 1, artisanat: 1, stock: 1, numerique: 1 },
      },
      {
        id: "beaucoup",
        label: "L’équivalent d’un mi-temps ou plus",
        scores: { stock: 2, artisanat: 2, revente: 1 },
      },
    ],
  },
  {
    id: "colis",
    text: "Gérer un stock, préparer des colis et traiter des retours, cela vous convient ?",
    options: [
      {
        id: "non",
        label: "Non, je préfère l’éviter",
        scores: { dropshipping: 2, pod: 2, numerique: 2 },
      },
      { id: "un-peu", label: "Oui, en petite quantité", scores: { artisanat: 2, revente: 2 } },
      { id: "oui", label: "Oui, sans problème", scores: { stock: 3, revente: 1 } },
    ],
  },
  {
    id: "fabriquer",
    text: "Savez-vous fabriquer un produit vous-même ?",
    options: [
      { id: "oui", label: "Oui", scores: { artisanat: 4 } },
      { id: "non", label: "Non", scores: {} },
    ],
  },
  {
    id: "graphisme",
    text: "Aimez-vous créer des visuels (dessins, textes, motifs) ?",
    options: [
      { id: "oui", label: "Oui, c’est mon point fort", scores: { pod: 3, numerique: 1 } },
      { id: "non", label: "Pas vraiment", scores: {} },
    ],
  },
  {
    id: "chiner",
    text: "Aimez-vous chercher des pièces, comparer, négocier ?",
    options: [
      { id: "oui", label: "Oui", scores: { revente: 3, stock: 1 } },
      { id: "non", label: "Pas vraiment", scores: {} },
    ],
  },
  {
    id: "expertise",
    text: "Avez-vous une expertise que d’autres paieraient pour apprendre ou utiliser ?",
    options: [
      { id: "oui", label: "Oui", scores: { numerique: 4 } },
      { id: "non", label: "Pas encore", scores: {} },
    ],
  },
  {
    id: "controle",
    text: "Est-il important pour vous de contrôler la qualité de chaque produit expédié ?",
    options: [
      {
        id: "essentiel",
        label: "Essentiel",
        scores: { stock: 2, artisanat: 2, revente: 1, dropshipping: -2 },
      },
      { id: "secondaire", label: "Je peux déléguer", scores: { dropshipping: 2, pod: 1 } },
    ],
  },
  {
    id: "magasin",
    text: "Avez-vous déjà un magasin, un stock ou des clients ?",
    options: [
      { id: "oui", label: "Oui", scores: { stock: 4 } },
      { id: "non", label: "Non, je pars de zéro", scores: {} },
    ],
  },
];

/** Tie-break order: lower financial risk first. */
export const MODEL_ORDER: ModelId[] = [
  "numerique",
  "pod",
  "revente",
  "artisanat",
  "dropshipping",
  "stock",
];
