/** Contact form subjects (stored as keys, shown as labels). */
export const CONTACT_TOPICS = {
  question: "Une question sur un guide ou un outil",
  erreur: "Signaler une erreur dans un contenu",
  formation: "Une formation ou une commande",
  donnees: "Mes données personnelles",
  accessibilite: "Un problème d’accessibilité",
  autre: "Autre chose",
} as const;

/** Contact messages are deleted after this many months. [À VALIDER] */
export const CONTACT_RETENTION_MONTHS = 36;
