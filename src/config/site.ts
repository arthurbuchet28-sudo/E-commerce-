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
    legalName: "[À COMPLÉTER : nom et prénom ou dénomination]",
    legalForm: "Micro-entreprise",
    siret: "[À COMPLÉTER]",
    address: "[À COMPLÉTER]",
    email: "[À COMPLÉTER]",
    publicationDirector: "[À COMPLÉTER]",
    vatNumber: null as string | null, // null while under the VAT franchise
  },

  /** Hosting provider, mandatory in the legal notice (LCEN). */
  hosting: {
    name: "Vercel Inc.", // [À VÉRIFIER — vercel.com/legal]
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis", // [À VÉRIFIER — vercel.com/legal]
    phone: "[À COMPLÉTER]",
    region: "Paris (cdg1)",
  },

  /** Consumer mediator (Code de la consommation): name and website. */
  mediator: {
    name: "[À COMPLÉTER : médiateur de la consommation désigné]",
    url: "[À COMPLÉTER]",
  },

  /** Contact for personal data requests and accessibility issues. */
  privacyContact: "[À COMPLÉTER : adresse e-mail dédiée aux données personnelles]",
  accessibilityContact: "[À COMPLÉTER : adresse e-mail de contact accessibilité]",

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
