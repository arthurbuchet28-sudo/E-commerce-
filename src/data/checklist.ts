/**
 * Launch checklist (tool 6): legal and practical points to validate before opening.
 * Item ids are stable storage keys: never reuse an id for a different point.
 */

export type ChecklistGroup = {
  id: string;
  title: string;
  items: Array<{ id: string; label: string }>;
};

export const launchChecklist: ChecklistGroup[] = [
  {
    id: "entreprise",
    title: "Entreprise et statut",
    items: [
      { id: "statut-choisi", label: "J’ai choisi mon statut en connaissance de cause." },
      { id: "immatriculation", label: "J’ai déclaré mon activité sur le guichet unique." },
      { id: "siret", label: "J’ai reçu mon numéro SIRET." },
      { id: "compte-bancaire", label: "J’ai un compte bancaire dédié à l’activité." },
      {
        id: "assurance",
        label: "J’ai vérifié mes besoins en assurance (responsabilité civile professionnelle).",
      },
      { id: "cotisations", label: "Je sais quand et comment déclarer mon chiffre d’affaires." },
    ],
  },
  {
    id: "legal",
    title: "Obligations légales du site",
    items: [
      {
        id: "mentions-legales",
        label: "Mes mentions légales sont complètes et accessibles depuis toutes les pages.",
      },
      { id: "cgv", label: "Mes CGV sont rédigées et acceptées avant chaque commande." },
      { id: "confidentialite", label: "Ma politique de confidentialité est en ligne." },
      { id: "cookies", label: "Aucun cookie non essentiel n’est déposé sans consentement." },
      {
        id: "retractation-info",
        label: "Le droit de rétractation et ses exceptions sont expliqués avant la commande.",
      },
      {
        id: "retractation-fonction",
        label: "Une fonction de rétractation en ligne est disponible pendant tout le délai.",
      },
      {
        id: "mediateur",
        label: "J’ai adhéré à un médiateur de la consommation et indiqué ses coordonnées.",
      },
      {
        id: "prix-ttc",
        label: "Les prix sont affichés TTC, frais de livraison indiqués avant le paiement.",
      },
      {
        id: "bouton-commande",
        label: "Le bouton de commande indique clairement l’obligation de payer.",
      },
      { id: "factures", label: "Mes factures portent les mentions obligatoires." },
      {
        id: "securite-produits",
        label: "J’ai vérifié les obligations de sécurité et d’étiquetage de mes produits.",
      },
    ],
  },
  {
    id: "boutique",
    title: "Boutique",
    items: [
      { id: "plateforme", label: "J’ai choisi ma plateforme selon mon profil et mon budget." },
      { id: "nom-domaine", label: "Mon nom de domaine est réservé." },
      { id: "accueil", label: "La page d’accueil dit clairement ce que je vends et à qui." },
      { id: "pages-infos", label: "Les pages livraison, retours, contact et FAQ sont en ligne." },
      { id: "mobile", label: "J’ai testé la boutique sur téléphone." },
      { id: "commande-test", label: "J’ai passé une commande test de bout en bout." },
      {
        id: "accessibilite",
        label: "Les images ont un texte alternatif et les contrastes sont lisibles.",
      },
      { id: "vitesse", label: "Les pages se chargent rapidement." },
    ],
  },
  {
    id: "produits",
    title: "Produits",
    items: [
      {
        id: "fiches-completes",
        label: "Chaque fiche a un titre clair, une description complète et un prix TTC.",
      },
      { id: "photos", label: "Chaque produit a plusieurs photos nettes." },
      { id: "marge-calculee", label: "J’ai calculé ma marge réelle pour chaque produit." },
      {
        id: "stock-suivi",
        label: "Je sais suivre mon stock ou la disponibilité chez mon fournisseur.",
      },
      {
        id: "fournisseur-fiable",
        label: "J’ai testé la qualité et les délais de mon fournisseur.",
      },
      {
        id: "caracteristiques",
        label: "Tailles, matières, dimensions et entretien sont indiqués.",
      },
    ],
  },
  {
    id: "paiement",
    title: "Paiement",
    items: [
      { id: "paiement-actif", label: "Un moyen de paiement sécurisé est activé." },
      { id: "frais-paiement", label: "Je connais les frais réels de chaque moyen de paiement." },
      { id: "paiement-test", label: "J’ai testé un paiement et un remboursement." },
      {
        id: "confirmation",
        label: "Le client reçoit un e-mail de confirmation après sa commande.",
      },
      { id: "fraude", label: "Je sais repérer une commande suspecte." },
    ],
  },
  {
    id: "logistique",
    title: "Livraison et retours",
    items: [
      { id: "transporteurs", label: "J’ai choisi mes transporteurs et modes de livraison." },
      { id: "tarifs-livraison", label: "Mes tarifs de livraison couvrent mes coûts réels." },
      { id: "delais", label: "Les délais de livraison annoncés sont réalistes." },
      { id: "emballages", label: "J’ai des emballages adaptés et un envoi test a été fait." },
      { id: "procedure-retour", label: "Ma procédure de retour est écrite et publiée." },
      { id: "suivi-colis", label: "Le client reçoit un numéro de suivi." },
    ],
  },
  {
    id: "clients",
    title: "Premiers clients",
    items: [
      { id: "canaux", label: "J’ai choisi un ou deux canaux d’acquisition." },
      { id: "newsletter", label: "L’inscription à ma newsletter recueille un consentement clair." },
      {
        id: "avis",
        label: "Je demande un avis à chaque client, sans jamais publier de faux avis.",
      },
      {
        id: "reseaux",
        label: "Mes comptes sur les réseaux sociaux indiquent le lien de la boutique.",
      },
      {
        id: "influence",
        label: "Si je travaille avec des créateurs, les contenus sponsorisés sont signalés.",
      },
      { id: "budget-pub", label: "Si je fais de la publicité, un budget maximal est fixé." },
    ],
  },
  {
    id: "pilotage",
    title: "Pilotage",
    items: [
      { id: "tableau-bord", label: "J’ai un tableau de bord mensuel de mes indicateurs." },
      { id: "seuils", label: "Je surveille les seuils de mon régime et de la franchise de TVA." },
      { id: "tresorerie", label: "Je sais combien de mois je peux tenir sans vente." },
      {
        id: "comptabilite",
        label: "Je tiens un livre des recettes et conserve mes justificatifs.",
      },
    ],
  },
];

export const checklistItemCount = launchChecklist.reduce((n, g) => n + g.items.length, 0);
