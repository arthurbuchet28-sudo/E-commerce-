import { launchChecklist, type ChecklistGroup } from "./checklist";

/**
 * Newsletter content. Editorial texts are drafts until reviewed ([À VALIDER], listed in
 * TODO-CONTENU.md): a draft e-mail of the welcome sequence is never sent in production.
 */

/** Consent text shown next to the (unchecked) newsletter checkbox. Versioned. */
export const NEWSLETTER_CONSENT_VERSION = "2026-09-v1";
export const NEWSLETTER_CONSENT_TEXT =
  "J’accepte de recevoir la newsletter de Première Vente : des conseils pour lancer ma boutique en ligne, avec 5 e-mails de bienvenue sur deux semaines, puis au plus un e-mail par semaine. Désinscription en un clic dans chaque e-mail.";

/**
 * Lead magnet: 25 points chosen among the 50 of the launch checklist (tool 6).
 * [À VALIDER] choice of the 25 points.
 */
export const LEAD_MAGNET_TITLE =
  "Checklist : les 25 points à valider avant d’ouvrir votre boutique";

const LEAD_MAGNET_IDS = [
  "statut-choisi",
  "immatriculation",
  "siret",
  "compte-bancaire",
  "assurance",
  "mentions-legales",
  "cgv",
  "confidentialite",
  "cookies",
  "retractation-info",
  "retractation-fonction",
  "mediateur",
  "prix-ttc",
  "bouton-commande",
  "factures",
  "nom-domaine",
  "mobile",
  "commande-test",
  "fiches-completes",
  "marge-calculee",
  "paiement-test",
  "confirmation",
  "tarifs-livraison",
  "procedure-retour",
  "tresorerie",
] as const;

export function leadMagnetGroups(): ChecklistGroup[] {
  const ids = new Set<string>(LEAD_MAGNET_IDS);
  return launchChecklist
    .map((g) => ({ ...g, items: g.items.filter((i) => ids.has(i.id)) }))
    .filter((g) => g.items.length > 0);
}

export const LEAD_MAGNET_COUNT = LEAD_MAGNET_IDS.length;

export type SequenceEmail = {
  /** 1 to 5. E-mail 1 is sent on confirmation. */
  step: number;
  /** Days after the previous e-mail. */
  delayDays: number;
  subject: string;
  paragraphs: string[];
  /** Site paths (absolute URLs are built when the e-mail is sent). */
  links: Array<{ label: string; path: `/${string}` }>;
  /** [À VALIDER]: drafts are not sent in production. */
  draft: boolean;
};

/**
 * Welcome sequence. E-mail 1 is functional (delivers the checklist); e-mails 2 to 5 are
 * editorial drafts. No figure here: figures live in the linked guides and tools.
 */
export const welcomeSequence: SequenceEmail[] = [
  {
    step: 1,
    delayDays: 0,
    subject: "Votre checklist : les 25 points à valider avant d’ouvrir",
    paragraphs: [
      "Merci d’avoir confirmé votre inscription. Voici la checklist promise, à télécharger en PDF.",
      "Cochez les points au fur et à mesure : ceux qui restent vides vous disent quoi faire ensuite. La version interactive de la checklist complète est aussi en ligne.",
    ],
    links: [{ label: "Ouvrir la checklist interactive", path: "/outils/checklist-lancement" }],
    draft: false,
  },
  {
    step: 2,
    delayDays: 2,
    subject: "Par où commencer ? Le parcours en 8 étapes",
    paragraphs: [
      "Se lancer dans le e-commerce, c’est une suite de décisions à prendre dans le bon ordre. Le parcours « Se lancer » les découpe en 8 étapes, chacune avec un objectif, des guides, un outil et une checklist.",
      "Si vous hésitez encore sur le modèle (stock, dropshipping, fabrication, revente…), le quiz vous aide à choisir en quelques minutes.",
    ],
    links: [
      { label: "Voir le parcours en 8 étapes", path: "/se-lancer" },
      { label: "Faire le quiz : quel modèle pour moi ?", path: "/outils/quel-modele-ecommerce" },
    ],
    draft: true,
  },
  {
    step: 3,
    delayDays: 3,
    subject: "Micro-entreprise : plafonds, TVA et seuils",
    paragraphs: [
      "Avant la première vente, il faut une existence légale. Pour beaucoup, c’est la micro-entreprise : simple à créer, mais avec des plafonds et des règles de TVA à connaître.",
      "Le guide fait le point, sources officielles à l’appui. Le simulateur vous montre ce qu’il reste une fois les cotisations payées.",
    ],
    links: [
      {
        label: "Lire le guide sur la micro-entreprise",
        path: "/guides/statut-et-creation/micro-entreprise-plafonds-tva-seuils",
      },
      {
        label: "Ouvrir le simulateur micro-entreprise",
        path: "/outils/simulateur-micro-entreprise",
      },
    ],
    draft: true,
  },
  {
    step: 4,
    delayDays: 4,
    subject: "Fixer son prix sans vendre à perte",
    paragraphs: [
      "Une erreur fréquente : fixer son prix en regardant la concurrence, sans compter les frais de port, les commissions et les cotisations.",
      "Le calculateur additionne tout, ligne par ligne, et vous donne le prix minimum et la marge réelle.",
    ],
    links: [
      { label: "Calculer mon prix et ma marge", path: "/outils/calculateur-prix-marge" },
      { label: "Trouver mon seuil de rentabilité", path: "/outils/seuil-de-rentabilite" },
    ],
    draft: true,
  },
  {
    step: 5,
    delayDays: 5,
    subject: "Les obligations légales de votre site",
    paragraphs: [
      "Mentions légales, CGV, droit de rétractation et fonction de rétractation en ligne : ce sont les points que l’on oublie le plus souvent, et ceux qui coûtent cher.",
      "Les guides détaillent chaque obligation. Pour aller plus loin, la formation « Les bases du e-commerce » est gratuite avec un compte.",
    ],
    links: [
      {
        label: "Les mentions légales d’un site e-commerce",
        path: "/guides/legal-et-conformite/mentions-legales-site-e-commerce",
      },
      {
        label: "Droit de rétractation et fonction en ligne",
        path: "/guides/legal-et-conformite/droit-de-retractation-fonction-en-ligne",
      },
      { label: "Suivre la formation gratuite", path: "/formations/les-bases-du-e-commerce" },
    ],
    draft: true,
  },
];

/** Retention of subscribers' data, in days. [À VALIDER] with the processing register (phase 12). */
export const NEWSLETTER_RETENTION = { pendingDays: 30, unsubscribedDays: 3 * 365 } as const;

/** Confirmation links expire after 7 days. */
export const CONFIRMATION_TTL_HOURS = 7 * 24;
