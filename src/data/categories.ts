/** Guide categories (section 5.1). Descriptions are used for category pages and SEO. */
export const guideCategories = [
  {
    slug: "idee-et-produit",
    title: "Idée et produit",
    description:
      "Trouver une idée, choisir un modèle de vente et sélectionner un produit qui répond à une vraie demande.",
  },
  {
    slug: "etude-de-marche",
    title: "Étude de marché",
    description:
      "Analyser la concurrence, mesurer la demande et tester votre idée à petit budget avant d’investir.",
  },
  {
    slug: "statut-et-creation",
    title: "Statut et création",
    description:
      "Choisir un statut juridique adapté à la vente en ligne et créer votre entreprise étape par étape.",
  },
  {
    slug: "legal-et-conformite",
    title: "Légal et conformité",
    description:
      "Mentions légales, CGV, TVA, droit de rétractation, RGPD, accessibilité : les obligations d’un site marchand.",
  },
  {
    slug: "plateformes-et-boutique",
    title: "Plateformes et boutique",
    description:
      "Choisir une plateforme, créer les pages indispensables et rédiger des fiches produits efficaces.",
  },
  {
    slug: "paiement-et-logistique",
    title: "Paiement et logistique",
    description:
      "Moyens de paiement, livraison, emballage, retours et service client : organiser l’après-vente.",
  },
  {
    slug: "marketing-et-acquisition",
    title: "Marketing et acquisition",
    description:
      "SEO, GEO, réseaux sociaux, e-mailing et publicité : attirer vos premiers clients sans exploser votre budget.",
  },
  {
    slug: "marketplaces-et-social-commerce",
    title: "Marketplaces et social commerce",
    description:
      "Vendre sur Amazon, Etsy, Vinted Pro ou TikTok Shop : avantages, commissions et pièges à éviter.",
  },
  {
    slug: "gestion-et-chiffres",
    title: "Gestion et chiffres",
    description:
      "Marge, trésorerie, indicateurs à suivre chaque mois : piloter votre activité avec des chiffres fiables.",
  },
  {
    slug: "outils-et-ia",
    title: "Outils et IA",
    description:
      "Les outils utiles au quotidien et l’usage raisonné de l’intelligence artificielle pour un petit e-commerce.",
  },
] as const;

export type GuideCategory = (typeof guideCategories)[number];

export function findCategory(slug: string) {
  return guideCategories.find((c) => c.slug === slug) ?? null;
}
