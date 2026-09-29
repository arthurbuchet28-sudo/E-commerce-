import type { Route } from "next";

/**
 * Registry of the site's static pages: single source for navigation labels, headings,
 * metadata, breadcrumbs, the sitemap and the « Plan du site » page.
 * Constraints (tested in routes.test.ts): `${title} · Première Vente` ≤ 60 characters,
 * description ≤ 155 characters, French typography.
 */

export type RouteGroup =
  "parcours" | "contenus" | "outils" | "site" | "compte" | "commande" | "legal" | "interne";

export type RouteEntry = {
  path: Route;
  /** Short label for navigation and breadcrumbs. */
  label: string;
  /** Visible page heading. */
  h1: string;
  /** Meta title, without the site-name suffix. */
  title: string;
  description: string;
  group: RouteGroup;
  indexable: boolean;
  /** Development phase that fills the page (for the team, not displayed). */
  phase: number;
};

export const routes = [
  {
    path: "/se-lancer",
    label: "Se lancer",
    h1: "Se lancer en 8 étapes",
    title: "Se lancer en 8 étapes",
    description:
      "De l’idée à la première vente : un parcours gratuit en 8 étapes, avec pour chacune un objectif, des guides, un outil et une checklist.",
    group: "parcours",
    indexable: true,
    phase: 5,
  },
  {
    path: "/guides",
    label: "Guides",
    h1: "Guides pour lancer votre e-commerce",
    title: "Guides pour lancer votre e-commerce",
    description:
      "Des guides gratuits, sourcés et datés pour lancer votre boutique en ligne : statut, TVA, obligations légales, plateformes, marketing et chiffres.",
    group: "contenus",
    indexable: true,
    phase: 4,
  },
  {
    path: "/formations",
    label: "Formations",
    h1: "Formations e-commerce",
    title: "Formations e-commerce",
    description:
      "Des formations structurées en vidéos, textes et quiz, dont une gratuite, pour créer et développer votre boutique en ligne pas à pas.",
    group: "contenus",
    indexable: true,
    phase: 8,
  },
  {
    path: "/outils",
    label: "Outils",
    h1: "Outils et calculateurs",
    title: "Outils et calculateurs gratuits",
    description:
      "Calculateur de prix et de marge, simulateur micro-entreprise, seuil de rentabilité, quiz d’orientation et checklist de lancement, sans compte.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/outils/calculateur-prix-marge",
    label: "Calculateur de prix et de marge",
    h1: "Calculateur de prix et de marge",
    title: "Calculateur de prix et de marge",
    description:
      "Calculez votre prix de vente minimum et votre marge en tenant compte des frais de port, des commissions, des frais de paiement et de la TVA.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/outils/simulateur-micro-entreprise",
    label: "Simulateur micro-entreprise",
    h1: "Simulateur micro-entreprise",
    title: "Simulateur micro-entreprise",
    description:
      "Estimez vos cotisations de micro-entrepreneur et surveillez les seuils de chiffre d’affaires et de franchise de TVA, méthode de calcul détaillée.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/outils/seuil-de-rentabilite",
    label: "Seuil de rentabilité",
    h1: "Calculer son seuil de rentabilité",
    title: "Calculer son seuil de rentabilité",
    description:
      "Calculez le nombre de ventes nécessaires chaque mois pour couvrir vos charges fixes, à partir de votre marge unitaire.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/outils/quel-modele-ecommerce",
    label: "Quiz : quel modèle pour moi ?",
    h1: "Quel modèle e-commerce pour moi ?",
    title: "Quiz : quel modèle e-commerce pour moi ?",
    description:
      "Stock, dropshipping, print-on-demand, artisanat, revente ou produits numériques : un quiz pour trouver le modèle adapté à votre situation.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/outils/comparateur-plateformes",
    label: "Comparateur de plateformes",
    h1: "Comparateur de plateformes e-commerce",
    title: "Comparateur de plateformes e-commerce",
    description:
      "Comparez Shopify, WooCommerce, PrestaShop, Wix, Squarespace et les marketplaces selon le coût, les commissions, la difficulté et votre profil.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/outils/checklist-lancement",
    label: "Checklist de lancement",
    h1: "Checklist de lancement",
    title: "Checklist de lancement d’une boutique",
    description:
      "Une checklist interactive des points légaux et pratiques à valider avant d’ouvrir votre boutique en ligne, avec sauvegarde de votre progression.",
    group: "outils",
    indexable: true,
    phase: 6,
  },
  {
    path: "/ressources",
    label: "Ressources",
    h1: "Modèles et checklists à télécharger",
    title: "Modèles et checklists à télécharger",
    description:
      "Modèles de documents et checklists à télécharger gratuitement pour préparer le lancement de votre boutique en ligne.",
    group: "contenus",
    indexable: true,
    phase: 10,
  },
  {
    path: "/glossaire",
    label: "Glossaire",
    h1: "Glossaire du e-commerce",
    title: "Glossaire du e-commerce",
    description:
      "Les termes du e-commerce expliqués simplement, de A à Z : panier moyen, taux de conversion, marketplace, franchise en base de TVA, SEO, GEO…",
    group: "contenus",
    indexable: true,
    phase: 4,
  },
  {
    path: "/veille-reglementaire",
    label: "Veille réglementaire",
    h1: "Veille réglementaire",
    title: "Veille réglementaire du e-commerce",
    description:
      "Les évolutions légales qui concernent les e-commerçants, datées et sourcées : entrée en vigueur, personnes concernées et guides mis à jour.",
    group: "contenus",
    indexable: true,
    phase: 4,
  },
  {
    path: "/faq",
    label: "FAQ",
    h1: "Questions fréquentes",
    title: "Questions fréquentes",
    description:
      "Les réponses aux questions fréquentes sur le site, les formations, les paiements, le droit de rétractation et vos données personnelles.",
    group: "site",
    indexable: true,
    phase: 4,
  },
  {
    path: "/a-propos",
    label: "À propos",
    h1: "À propos de Première Vente",
    title: "À propos, méthode et sources",
    description:
      "Qui est derrière le site, notre méthode éditoriale, nos sources et nos engagements : pas de promesse de revenus, des contenus datés et sourcés.",
    group: "site",
    indexable: true,
    phase: 12,
  },
  {
    path: "/contact",
    label: "Contact",
    h1: "Nous contacter",
    title: "Contact",
    description:
      "Posez une question ou signalez une erreur dans un contenu : nous vous répondons par e-mail.",
    group: "site",
    indexable: true,
    phase: 10,
  },
  {
    path: "/plan-du-site",
    label: "Plan du site",
    h1: "Plan du site",
    title: "Plan du site",
    description: "Toutes les pages du site Première Vente, classées par rubrique.",
    group: "site",
    indexable: true,
    phase: 3,
  },
  {
    path: "/compte",
    label: "Mon compte",
    h1: "Mon compte",
    title: "Mon compte",
    description:
      "Votre tableau de bord : progression, formations, achats, attestations et préférences.",
    group: "compte",
    indexable: false,
    phase: 7,
  },
  {
    path: "/compte/connexion",
    label: "Connexion",
    h1: "Se connecter",
    title: "Se connecter",
    description:
      "Connectez-vous pour retrouver votre progression, vos formations et vos simulations.",
    group: "compte",
    indexable: false,
    phase: 7,
  },
  {
    path: "/compte/inscription",
    label: "Inscription",
    h1: "Créer un compte",
    title: "Créer un compte",
    description:
      "Créez un compte gratuit pour suivre la formation « Les bases » et enregistrer votre progression.",
    group: "compte",
    indexable: false,
    phase: 7,
  },
  {
    path: "/compte/mot-de-passe",
    label: "Mot de passe oublié",
    h1: "Réinitialiser mon mot de passe",
    title: "Mot de passe oublié",
    description: "Recevez un lien par e-mail pour choisir un nouveau mot de passe.",
    group: "compte",
    indexable: false,
    phase: 7,
  },
  {
    path: "/panier",
    label: "Panier",
    h1: "Mon panier",
    title: "Panier",
    description: "Les formations que vous vous apprêtez à acheter.",
    group: "commande",
    indexable: false,
    phase: 9,
  },
  {
    path: "/commande/succes",
    label: "Commande confirmée",
    h1: "Merci, votre commande est confirmée",
    title: "Commande confirmée",
    description: "Votre paiement est accepté. Vous recevez un e-mail de confirmation.",
    group: "commande",
    indexable: false,
    phase: 9,
  },
  {
    path: "/commande/annulee",
    label: "Commande annulée",
    h1: "Votre commande a été annulée",
    title: "Commande annulée",
    description:
      "Aucun paiement n’a été effectué. Vous pouvez reprendre votre commande à tout moment.",
    group: "commande",
    indexable: false,
    phase: 9,
  },
  {
    path: "/retractation",
    label: "Se rétracter",
    h1: "Exercer mon droit de rétractation",
    title: "Exercer mon droit de rétractation",
    description:
      "Exercez votre droit de rétractation en ligne en deux étapes, sans avoir à vous connecter : identifiez votre commande puis confirmez.",
    group: "legal",
    indexable: true,
    phase: 9,
  },
  {
    path: "/mentions-legales",
    label: "Mentions légales",
    h1: "Mentions légales",
    title: "Mentions légales",
    description: "Éditeur, directeur de la publication et hébergeur du site Première Vente.",
    group: "legal",
    indexable: true,
    phase: 12,
  },
  {
    path: "/cgv",
    label: "CGV",
    h1: "Conditions générales de vente",
    title: "Conditions générales de vente",
    description:
      "Conditions de vente des formations en ligne : prix, accès, paiement, droit de rétractation, garanties et médiation.",
    group: "legal",
    indexable: true,
    phase: 12,
  },
  {
    path: "/cgu",
    label: "CGU",
    h1: "Conditions générales d’utilisation",
    title: "Conditions générales d’utilisation",
    description:
      "Règles d’utilisation du site et de l’espace membre, propriété intellectuelle des contenus et responsabilités.",
    group: "legal",
    indexable: true,
    phase: 12,
  },
  {
    path: "/confidentialite",
    label: "Confidentialité",
    h1: "Politique de confidentialité",
    title: "Politique de confidentialité",
    description:
      "Quelles données nous traitons, pourquoi, combien de temps, avec quels sous-traitants, et comment exercer vos droits.",
    group: "legal",
    indexable: true,
    phase: 12,
  },
  {
    path: "/cookies",
    label: "Cookies",
    h1: "Cookies et traceurs",
    title: "Cookies et traceurs",
    description:
      "Les traceurs utilisés sur le site, leur finalité, et comment gérer vos choix à tout moment.",
    group: "legal",
    indexable: true,
    phase: 12,
  },
  {
    path: "/accessibilite",
    label: "Accessibilité",
    h1: "Déclaration d’accessibilité",
    title: "Déclaration d’accessibilité",
    description:
      "Niveau de conformité du site au RGAA, contenus non accessibles, contact et voies de recours.",
    group: "legal",
    indexable: true,
    phase: 12,
  },
  {
    path: "/admin",
    label: "Administration",
    h1: "Administration",
    title: "Administration",
    description: "Back-office de gestion des formations, des élèves et des achats.",
    group: "interne",
    indexable: false,
    phase: 11,
  },
] as const satisfies readonly RouteEntry[];

export type StaticPath = (typeof routes)[number]["path"];

export function getRoute(path: StaticPath): RouteEntry {
  const entry = routes.find((r) => r.path === path);
  if (!entry) throw new Error(`Unknown route: ${path}`);
  return entry;
}

export function findRoute(path: string): RouteEntry | undefined {
  return routes.find((r) => r.path === path);
}

/** Main navigation (header). */
export const mainNav: StaticPath[] = [
  "/se-lancer",
  "/guides",
  "/formations",
  "/outils",
  "/ressources",
];

/** Footer columns. */
export const footerNav: Array<{ title: string; paths: StaticPath[] }> = [
  {
    title: "Apprendre",
    paths: [
      "/se-lancer",
      "/guides",
      "/formations",
      "/outils",
      "/ressources",
      "/glossaire",
      "/veille-reglementaire",
    ],
  },
  { title: "Le site", paths: ["/a-propos", "/faq", "/contact", "/plan-du-site", "/accessibilite"] },
  {
    title: "Informations légales",
    paths: ["/mentions-legales", "/cgv", "/cgu", "/confidentialite", "/cookies"],
  },
];
