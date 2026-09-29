import type { Route } from "next";

/**
 * The 8 steps of the « Se lancer » path (section 4.2).
 *
 * - `duration` is an editorial estimate for a beginner working part-time [À VALIDER].
 * - `guides` lists the guides of the editorial programme (section 5.2) for the step: only
 *   those already written are linked, the others are announced as « à paraître ».
 * - Checklist items are stored by index: when editing a checklist, append items rather than
 *   reordering them, or bump PARCOURS_STORAGE_VERSION.
 */

export type PlannedGuide = { category: string; slug: string; title: string };

export type ParcoursStep = {
  slug: string;
  title: string;
  objective: string;
  duration: string;
  deliverables: string[];
  guides: PlannedGuide[];
  tool?: Route;
  /** Related course of the catalogue (section 5.3), linked once the LMS exists (phase 8). */
  course: string;
  checklist: string[];
};

export const PARCOURS_STORAGE_VERSION = 1;

export const parcoursSteps: ParcoursStep[] = [
  {
    slug: "trouver-son-idee",
    title: "Trouver son idée et son modèle",
    objective:
      "Choisir un produit et un modèle de vente compatibles avec votre budget, votre temps et vos compétences.",
    duration: "1 à 2 semaines",
    deliverables: [
      "une idée de produit décrite en une phrase, avec son client type",
      "le modèle de vente retenu (stock, dropshipping, print-on-demand, artisanat, revente ou numérique)",
      "le budget maximal que vous acceptez d’engager pour tester",
    ],
    guides: [
      {
        category: "idee-et-produit",
        slug: "se-lancer-dans-le-e-commerce",
        title: "Se lancer dans le e-commerce en 2026 : le guide complet pour débutants",
      },
      {
        category: "idee-et-produit",
        slug: "les-6-modeles-de-e-commerce",
        title: "Les 6 modèles de e-commerce : lequel choisir selon votre profil",
      },
      {
        category: "idee-et-produit",
        slug: "dropshipping",
        title: "Dropshipping : fonctionnement, vraies marges, risques juridiques et alternatives",
      },
      {
        category: "idee-et-produit",
        slug: "print-on-demand",
        title: "Print-on-demand : se lancer sans stock",
      },
      {
        category: "idee-et-produit",
        slug: "trouver-un-produit",
        title: "Trouver un produit qui se vend : méthodes et outils",
      },
    ],
    tool: "/outils/quel-modele-ecommerce",
    course: "Les bases du e-commerce (gratuite)",
    checklist: [
      "J’ai fait le quiz « Quel modèle e-commerce pour moi ? ».",
      "J’ai décrit mon produit et mon client type en une phrase.",
      "J’ai choisi un modèle de vente et noté ses principaux risques.",
      "J’ai fixé le budget maximal que je peux perdre sans me mettre en difficulté.",
      "J’ai estimé le temps que je peux y consacrer chaque semaine.",
    ],
  },
  {
    slug: "valider-le-marche",
    title: "Valider le marché",
    objective:
      "Vérifier qu’il existe des acheteurs avant d’investir dans du stock ou une boutique.",
    duration: "2 à 4 semaines",
    deliverables: [
      "une liste de concurrents avec leurs prix et ce que leurs clients critiquent",
      "le résultat d’un test réel (précommandes, liste d’attente ou petite vente)",
      "un prix de vente qui couvre vos coûts",
    ],
    guides: [
      {
        category: "etude-de-marche",
        slug: "valider-son-idee-petit-budget",
        title: "Valider son idée avec un petit budget : pré-vente, landing page, test",
      },
      {
        category: "etude-de-marche",
        slug: "analyser-ses-concurrents",
        title: "Analyser ses concurrents en une après-midi",
      },
    ],
    tool: "/outils/calculateur-prix-marge",
    course: "F1 · Trouver et valider son produit",
    checklist: [
      "J’ai listé au moins trois concurrents et relevé leurs prix.",
      "J’ai lu les avis de leurs clients et noté les critiques qui reviennent.",
      "J’ai calculé un prix de vente qui couvre tous mes coûts.",
      "J’ai mené un test auprès de vrais acheteurs potentiels.",
      "J’ai décidé, au vu du test, de continuer, d’ajuster ou d’arrêter.",
    ],
  },
  {
    slug: "choisir-son-statut",
    title: "Choisir son statut et créer son entreprise",
    objective: "Choisir un statut adapté et immatriculer votre activité avant la première vente.",
    duration: "1 à 3 semaines",
    deliverables: [
      "un statut juridique choisi en connaissance de cause",
      "votre numéro SIRET",
      "un compte bancaire dédié à l’activité",
    ],
    guides: [
      {
        category: "statut-et-creation",
        slug: "statut-pour-vendre-en-ligne",
        title: "Micro-entreprise, EI, EURL, SASU : quel statut pour vendre en ligne",
      },
      {
        category: "statut-et-creation",
        slug: "micro-entreprise-plafonds-tva-seuils",
        title: "Micro-entreprise : plafonds de CA, franchise de TVA et seuils à surveiller",
      },
      {
        category: "statut-et-creation",
        slug: "creer-sa-micro-entreprise",
        title: "Créer sa micro-entreprise pas à pas sur le guichet unique",
      },
    ],
    tool: "/outils/simulateur-micro-entreprise",
    course: "F2 · Créer son entreprise et être en règle",
    checklist: [
      "J’ai comparé les statuts possibles pour mon projet.",
      "J’ai fait une simulation de mes cotisations.",
      "J’ai déclaré mon activité sur le guichet unique des formalités d’entreprises.",
      "J’ai reçu mon numéro SIRET.",
      "J’ai ouvert un compte bancaire dédié à l’activité.",
    ],
  },
  {
    slug: "se-mettre-en-conformite",
    title: "Se mettre en conformité",
    objective:
      "Préparer les documents et les mécanismes obligatoires d’un site marchand avant d’ouvrir.",
    duration: "1 à 2 semaines",
    deliverables: [
      "vos mentions légales, CGV et politique de confidentialité",
      "une facturation conforme (avec la mention de franchise de TVA si vous en bénéficiez)",
      "un parcours de rétractation en ligne",
    ],
    guides: [
      {
        category: "legal-et-conformite",
        slug: "tva-e-commerce",
        title:
          "TVA en e-commerce : franchise, taux, ventes à distance dans l’UE et guichet unique OSS",
      },
      {
        category: "legal-et-conformite",
        slug: "mentions-legales-site-e-commerce",
        title: "Mentions légales d’un site e-commerce : la liste complète",
      },
      {
        category: "legal-et-conformite",
        slug: "rediger-ses-cgv",
        title: "Rédiger ses CGV : ce qui est obligatoire",
      },
      {
        category: "legal-et-conformite",
        slug: "droit-de-retractation-fonction-en-ligne",
        title: "Droit de rétractation et fonction de rétractation en ligne obligatoire",
      },
      {
        category: "legal-et-conformite",
        slug: "rgpd-cookies-petit-e-commerce",
        title: "RGPD et cookies pour un petit e-commerce : l’essentiel",
      },
      {
        category: "legal-et-conformite",
        slug: "accessibilite-european-accessibility-act",
        title: "Accessibilité numérique : êtes-vous concerné par l’European Accessibility Act ?",
      },
      {
        category: "legal-et-conformite",
        slug: "securite-des-produits-gpsr",
        title: "Sécurité des produits (règlement GPSR) : obligations quand on vend en ligne",
      },
      {
        category: "legal-et-conformite",
        slug: "facturation-electronique",
        title: "Facturation électronique et e-reporting : ce qui change pour les e-commerçants",
      },
    ],
    tool: "/outils/checklist-lancement",
    course: "F2 · Créer son entreprise et être en règle",
    checklist: [
      "Mes mentions légales sont complètes.",
      "Mes CGV couvrent prix, livraison, rétractation, garanties et médiation.",
      "Ma politique de confidentialité décrit les données collectées et vos droits.",
      "Ma boutique propose une fonction de rétractation en ligne.",
      "Mes factures portent toutes les mentions obligatoires.",
      "J’ai vérifié les obligations de sécurité de mes produits.",
    ],
  },
  {
    slug: "creer-sa-boutique",
    title: "Choisir sa plateforme et créer sa boutique",
    objective: "Ouvrir une boutique claire, rassurante et facile à utiliser sur mobile.",
    duration: "2 à 4 semaines",
    deliverables: [
      "une plateforme choisie selon votre profil",
      "les pages indispensables : accueil, fiches produits, livraison, contact, pages légales",
      "des fiches produits complètes avec de bonnes photos",
    ],
    guides: [
      {
        category: "plateformes-et-boutique",
        slug: "comparatif-plateformes",
        title: "Shopify, WooCommerce, PrestaShop, Wix : comparatif honnête",
      },
      {
        category: "plateformes-et-boutique",
        slug: "pages-indispensables",
        title: "Les pages indispensables d’une boutique qui convertit",
      },
      {
        category: "plateformes-et-boutique",
        slug: "fiches-produits",
        title: "Rédiger des fiches produits qui vendent (et qui sont lues par les IA)",
      },
      {
        category: "plateformes-et-boutique",
        slug: "photos-produits-smartphone",
        title: "Photos produits avec un smartphone",
      },
    ],
    tool: "/outils/comparateur-plateformes",
    course: "F3 · Créer sa boutique pas à pas",
    checklist: [
      "J’ai comparé au moins deux plateformes selon mon profil et mon budget.",
      "Ma boutique a une page d’accueil qui dit clairement ce que je vends.",
      "Chaque fiche produit a un prix TTC, des photos et une description complète.",
      "Les pages livraison, contact et légales sont accessibles depuis toutes les pages.",
      "J’ai testé la boutique sur mon téléphone.",
    ],
  },
  {
    slug: "paiement-livraison-retours",
    title: "Paiement, livraison, retours, service client",
    objective:
      "Organiser tout ce qui se passe après le clic sur « Payer », sans y passer vos soirées.",
    duration: "1 à 2 semaines",
    deliverables: [
      "un moyen de paiement en ligne sécurisé",
      "des modes et tarifs de livraison connus à l’avance",
      "une procédure de retour et des réponses types pour le service client",
    ],
    guides: [
      {
        category: "paiement-et-logistique",
        slug: "moyens-de-paiement",
        title: "Moyens de paiement : Stripe, PayPal, paiement fractionné, frais réels",
      },
      {
        category: "paiement-et-logistique",
        slug: "livraison",
        title: "Livraison : transporteurs, points relais, tarifs, emballage",
      },
      {
        category: "paiement-et-logistique",
        slug: "retours-service-client",
        title: "Gérer les retours et le service client sans y passer ses soirées",
      },
    ],
    tool: "/outils/calculateur-prix-marge",
    course: "F4 · Paiement, logistique et service client",
    checklist: [
      "J’ai activé un moyen de paiement et connais ses frais réels.",
      "J’ai choisi mes modes de livraison et fixé ce que je facture au client.",
      "J’ai préparé mes emballages et fait un envoi test.",
      "J’ai écrit ma procédure de retour.",
      "J’ai préparé des réponses types aux questions fréquentes.",
    ],
  },
  {
    slug: "attirer-ses-premiers-clients",
    title: "Attirer ses premiers clients",
    objective: "Choisir un ou deux canaux d’acquisition tenables et obtenir vos premières ventes.",
    duration: "4 à 8 semaines",
    deliverables: [
      "un ou deux canaux d’acquisition choisis et suivis",
      "une liste d’abonnés que vous possédez (e-mail)",
      "vos premiers avis clients authentiques",
    ],
    guides: [
      {
        category: "marketing-et-acquisition",
        slug: "seo-e-commerce",
        title: "SEO e-commerce : les bases pour être trouvé sur Google",
      },
      {
        category: "marketing-et-acquisition",
        slug: "geo-assistants-ia",
        title: "GEO : être recommandé par ChatGPT, Gemini et les assistants IA",
      },
      {
        category: "marketplaces-et-social-commerce",
        slug: "social-commerce",
        title: "Vendre sur TikTok Shop et Instagram : le social commerce pour débutants",
      },
      {
        category: "marketplaces-et-social-commerce",
        slug: "vendre-sur-les-marketplaces",
        title: "Vendre sur les marketplaces : avantages et pièges",
      },
    ],
    course: "F5 · Attirer ses premiers clients",
    checklist: [
      "J’ai choisi un ou deux canaux où se trouvent mes clients.",
      "J’ai publié régulièrement pendant un mois sur ces canaux.",
      "J’ai mis en place une inscription à ma newsletter, avec consentement.",
      "J’ai demandé un avis à chacun de mes premiers clients.",
      "Si je fais de la publicité, j’ai fixé un budget maximal à l’avance.",
    ],
  },
  {
    slug: "piloter-et-rentabiliser",
    title: "Piloter et rentabiliser",
    objective: "Suivre vos chiffres chaque mois et décider sur des faits, pas sur des impressions.",
    duration: "En continu, une heure par mois",
    deliverables: [
      "un tableau de bord mensuel de quelques indicateurs",
      "votre marge réelle, une fois tous les frais déduits",
      "une décision argumentée : continuer, ajuster ou changer d’échelle",
    ],
    guides: [
      {
        category: "gestion-et-chiffres",
        slug: "indicateurs-a-suivre",
        title: "Les 8 indicateurs à suivre chaque mois",
      },
    ],
    tool: "/outils/seuil-de-rentabilite",
    course: "F7 · Piloter et rentabiliser",
    checklist: [
      "Je note chaque mois mon chiffre d’affaires et mon nombre de commandes.",
      "Je calcule mon panier moyen et mon taux de conversion.",
      "Je connais ma marge réelle après frais de port, commissions et retours.",
      "Je surveille les seuils de mon régime et de la franchise de TVA.",
      "Je connais mon seuil de rentabilité mensuel.",
    ],
  },
];

export function findStep(slug: string) {
  const index = parcoursSteps.findIndex((s) => s.slug === slug);
  return index === -1 ? null : { ...parcoursSteps[index], number: index + 1 };
}

export function stepHref(slug: string): Route {
  return `/se-lancer/${slug}` as Route;
}
