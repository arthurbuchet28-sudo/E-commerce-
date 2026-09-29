/**
 * Platforms compared in tool 5. Qualitative assessments are editorial [À VALIDER].
 * Prices and commissions change often: they are NOT stored here as figures. Each platform
 * links to its official pricing page, to check before choosing [À VÉRIFIER].
 */

export type Level = 1 | 2 | 3;
export type PlatformKind = "boutique" | "marketplace";
export type ProfileId =
  "demarrer-vite" | "maitriser" | "createur" | "revente" | "gros-catalogue" | "video";

export const profiles: Record<ProfileId, string> = {
  "demarrer-vite": "Démarrer vite sans compétence technique",
  maitriser: "Maîtriser et personnaliser son site",
  createur: "Créateur, artisan, image de marque",
  revente: "Revente, seconde main",
  "gros-catalogue": "Catalogue important",
  video: "À l’aise avec la vidéo et les réseaux sociaux",
};

export type Platform = {
  id: string;
  name: string;
  kind: PlatformKind;
  model: string;
  costs: string;
  pricingUrl: string;
  difficulty: Level;
  customization: Level;
  seo: Level;
  extensions: string;
  hosting: string;
  profiles: ProfileId[];
  note: string;
  checkedAt: string;
};

const CHECKED = "2026-09-29";
const PRICES = "Abonnement ou commission : voir la page tarifs officielle [À VÉRIFIER]";

export const platforms: Platform[] = [
  {
    id: "shopify",
    name: "Shopify",
    kind: "boutique",
    model: "Solution clé en main hébergée, par abonnement",
    costs: PRICES,
    pricingUrl: "https://www.shopify.com/fr",
    difficulty: 1,
    customization: 2,
    seo: 2,
    extensions: "Très nombreuses applications, souvent payantes",
    hosting: "Inclus",
    profiles: ["demarrer-vite", "createur", "gros-catalogue"],
    note: "Additionnez l’abonnement, les applications et les frais de paiement pour connaître le coût réel.",
    checkedAt: CHECKED,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    kind: "boutique",
    model: "Extension open source de WordPress",
    costs:
      "Extension gratuite ; hébergement, nom de domaine et extensions payantes à prévoir [À VÉRIFIER]",
    pricingUrl: "https://woocommerce.com",
    difficulty: 2,
    customization: 3,
    seo: 3,
    extensions: "Très nombreuses extensions WordPress",
    hosting: "À prévoir",
    profiles: ["maitriser", "createur"],
    note: "Mises à jour et sécurité sont à votre charge ou à celle de votre hébergeur.",
    checkedAt: CHECKED,
  },
  {
    id: "prestashop",
    name: "PrestaShop",
    kind: "boutique",
    model: "Solution e-commerce open source",
    costs: "Logiciel gratuit ; hébergement et modules à prévoir [À VÉRIFIER]",
    pricingUrl: "https://www.prestashop.com/fr",
    difficulty: 3,
    customization: 3,
    seo: 2,
    extensions: "Modules nombreux, souvent payants",
    hosting: "À prévoir",
    profiles: ["maitriser", "gros-catalogue"],
    note: "Adapté si vous êtes accompagné par un prestataire technique.",
    checkedAt: CHECKED,
  },
  {
    id: "wix",
    name: "Wix",
    kind: "boutique",
    model: "Créateur de site hébergé avec offres e-commerce",
    costs: PRICES,
    pricingUrl: "https://fr.wix.com",
    difficulty: 1,
    customization: 2,
    seo: 2,
    extensions: "Applications intégrées",
    hosting: "Inclus",
    profiles: ["demarrer-vite", "createur"],
    note: "Pratique pour un petit catalogue associé à un site vitrine.",
    checkedAt: CHECKED,
  },
  {
    id: "squarespace",
    name: "Squarespace",
    kind: "boutique",
    model: "Créateur de site hébergé orienté design",
    costs: PRICES,
    pricingUrl: "https://fr.squarespace.com",
    difficulty: 1,
    customization: 2,
    seo: 2,
    extensions: "Extensions en nombre limité",
    hosting: "Inclus",
    profiles: ["demarrer-vite", "createur"],
    note: "Des modèles soignés pour une marque qui mise sur l’image.",
    checkedAt: CHECKED,
  },
  {
    id: "amazon",
    name: "Amazon",
    kind: "marketplace",
    model: "Marketplace généraliste",
    costs: PRICES,
    pricingUrl: "https://sell.amazon.fr",
    difficulty: 2,
    customization: 1,
    seo: 1,
    extensions: "Services logistiques optionnels",
    hosting: "Sans objet",
    profiles: ["gros-catalogue", "demarrer-vite"],
    note: "Très forte audience, mais concurrence sur les prix et règles strictes.",
    checkedAt: CHECKED,
  },
  {
    id: "cdiscount",
    name: "Cdiscount",
    kind: "marketplace",
    model: "Marketplace généraliste française",
    costs: PRICES,
    pricingUrl: "https://www.cdiscount.com",
    difficulty: 2,
    customization: 1,
    seo: 1,
    extensions: "Sans objet",
    hosting: "Sans objet",
    profiles: ["gros-catalogue"],
    note: "Orientée produits grand public.",
    checkedAt: CHECKED,
  },
  {
    id: "etsy",
    name: "Etsy",
    kind: "marketplace",
    model: "Marketplace du fait main, du vintage et des créations",
    costs: PRICES,
    pricingUrl: "https://www.etsy.com/fr",
    difficulty: 1,
    customization: 1,
    seo: 2,
    extensions: "Sans objet",
    hosting: "Sans objet",
    profiles: ["createur", "demarrer-vite"],
    note: "Une audience qui cherche des créations : adapté pour tester une collection.",
    checkedAt: CHECKED,
  },
  {
    id: "vinted-pro",
    name: "Vinted Pro",
    kind: "marketplace",
    model: "Seconde main, offre pour les vendeurs professionnels",
    costs: "Conditions et frais pour les professionnels : voir le site officiel [À VÉRIFIER]",
    pricingUrl: "https://www.vinted.fr",
    difficulty: 1,
    customization: 1,
    seo: 1,
    extensions: "Sans objet",
    hosting: "Sans objet",
    profiles: ["revente"],
    note: "Pensé pour la mode et les objets de seconde main.",
    checkedAt: CHECKED,
  },
  {
    id: "leboncoin-pro",
    name: "Leboncoin Pro",
    kind: "marketplace",
    model: "Petites annonces, offre pour les professionnels",
    costs: PRICES,
    pricingUrl: "https://www.leboncoin.fr",
    difficulty: 1,
    customization: 1,
    seo: 1,
    extensions: "Sans objet",
    hosting: "Sans objet",
    profiles: ["revente"],
    note: "Utile pour la revente et la vente locale.",
    checkedAt: CHECKED,
  },
  {
    id: "tiktok-shop",
    name: "TikTok Shop",
    kind: "marketplace",
    model: "Social commerce intégré au réseau social",
    costs: PRICES,
    pricingUrl: "https://www.tiktok.com",
    difficulty: 2,
    customization: 1,
    seo: 1,
    extensions: "Sans objet",
    hosting: "Sans objet",
    profiles: ["video", "createur"],
    note: "Les ventes dépendent de vos vidéos et des créateurs partenaires ; encadrement légal de l’influence commerciale.",
    checkedAt: CHECKED,
  },
];

export const levelLabel: Record<Level, string> = { 1: "Faible", 2: "Moyenne", 3: "Élevée" };
