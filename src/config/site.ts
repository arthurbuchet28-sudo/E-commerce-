/**
 * Site-wide configuration. Anything tagged [À COMPLÉTER] / [À VÉRIFIER] is listed
 * in TODO-CONTENU.md and must be filled in before going live.
 */
export const siteConfig = {
  name: "Première Vente",
  tagline:
    "Passer de l’idée à la première vente en ligne, étape par étape, en restant en règle avec le droit français.",
  domain: "premiere-vente.fr", // [À VÉRIFIER disponibilité]
  locale: "fr-FR",
  defaultAuthor: "La rédaction",

  publisher: {
    legalName: "[À COMPLÉTER : nom et prénom ou dénomination]",
    legalForm: "Micro-entreprise",
    siret: "[À COMPLÉTER]",
    address: "[À COMPLÉTER]",
    email: "[À COMPLÉTER]",
    publicationDirector: "[À COMPLÉTER]",
    vatNumber: null as string | null, // null while under the VAT franchise
  },

  /** Paid courses access duration, in months. */
  courseAccessMonths: 24,

  /**
   * Professional training flags. All disabled by default: never display "éligible CPF"
   * or the Qualiopi logo unless these are explicitly set to true.
   */
  training: {
    showNda: false,
    ndaNumber: null as string | null,
    qualiopi: false,
    cpf: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
