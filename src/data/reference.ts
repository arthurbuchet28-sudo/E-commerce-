/**
 * Single source of every regulatory or numeric fact displayed on the site.
 *
 * Rules (see CLAUDE.md):
 * - Components, tools and MDX (<Chiffre id="…" />) read ONLY from this file.
 * - Every value has a source and a check date. A test fails when `checkedAt` is older
 *   than 12 months.
 * - `status: "a-verifier"` marks values not yet confirmed on the official source:
 *   they are displayed with the tag [À VÉRIFIER] and listed in TODO-CONTENU.md.
 *
 * Initial values come from the project specification (stated as checked in September
 * 2026). Deep links to the exact source pages are to be confirmed before launch.
 */

export type RefSource = {
  name: string;
  /** Short label shown inline next to a figure. */
  short: string;
  url: string;
};

export type RefValue = {
  /** Number, ISO date (YYYY-MM-DD) or text. `null` when not yet known. */
  value: number | string | null;
  unit:
    | "eur"
    | "eur-ht"
    | "md-eur"
    | "percent"
    | "percent-change"
    | "days"
    | "months"
    | "years"
    | "date"
    | "millions"
    | "milliards"
    | "count"
    | "text";
  label: string;
  source: RefSource;
  /** YYYY-MM-DD */
  checkedAt: string;
  /** YYYY-MM-DD, when the value has a known end of validity. */
  validUntil?: string;
  note?: string;
  /** Prefix displayed before the value, e.g. "plus de". */
  qualifier?: string;
  status: "verifie" | "a-verifier";
};

const SOURCES = {
  urssaf: { name: "Urssaf", short: "Urssaf", url: "https://www.urssaf.fr" },
  servicePublic: {
    name: "Service-public.fr",
    short: "Service-public.fr",
    url: "https://entreprendre.service-public.fr",
  },
  impots: { name: "impots.gouv.fr", short: "impots.gouv.fr", url: "https://www.impots.gouv.fr" },
  cgi293B: {
    name: "Code général des impôts, art. 293 B",
    short: "CGI",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577",
  },
  codeConso: {
    name: "Code de la consommation",
    short: "Code de la consommation",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069565",
  },
  ordonnance2026: {
    name: "Ordonnance n° 2026-2 du 5 janvier 2026 (art. L221-21 C. conso)",
    short: "Ordonnance 2026-2",
    url: "https://www.legifrance.gouv.fr",
  },
  directive2023_2673: {
    name: "Directive (UE) 2023/2673 (fonction de rétractation, art. 11 bis directive 2011/83/UE)",
    short: "Directive 2023/2673",
    url: "https://eur-lex.europa.eu/eli/dir/2023/2673/oj",
  },
  decret2023_931: {
    name: "Décret n° 2023-931",
    short: "Décret 2023-931",
    url: "https://www.legifrance.gouv.fr",
  },
  directive2019_882: {
    name: "Directive (UE) 2019/882 (European Accessibility Act)",
    short: "Directive 2019/882",
    url: "https://eur-lex.europa.eu/eli/dir/2019/882/oj",
  },
  codeCommerce: {
    name: "Code de commerce",
    short: "Code de commerce",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379",
  },
  cnilCookies: {
    name: "CNIL, lignes directrices et recommandation « cookies et autres traceurs »",
    short: "CNIL",
    url: "https://www.cnil.fr/fr/cookies-et-autres-traceurs",
  },
  cnilPlainte: {
    name: "CNIL, adresser une plainte",
    short: "CNIL",
    url: "https://www.cnil.fr/fr/plaintes",
  },
  gpsr: {
    name: "Règlement (UE) 2023/988 relatif à la sécurité générale des produits (GPSR)",
    short: "Règlement GPSR",
    url: "https://eur-lex.europa.eu/eli/reg/2023/988/oj",
  },
  impotsFacturation: {
    name: "impots.gouv.fr, facturation électronique et e-reporting",
    short: "impots.gouv.fr",
    url: "https://www.impots.gouv.fr/professionnel/facturation-electronique",
  },
  loiInfluence: {
    name: "Loi n° 2023-451 du 9 juin 2023 (influence commerciale)",
    short: "Loi influence",
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047663185",
  },
  fevad2025: {
    name: "Fevad, bilan du e-commerce 2025 (publié le 11/02/2026)",
    short: "Fevad",
    url: "https://www.fevad.com",
  },
} satisfies Record<string, RefSource>;

const SPEC_CHECK = "2026-09-01";
const SPEC_NOTE =
  "Valeur du cahier des charges, à reconfirmer sur la source officielle avant mise en ligne.";

export const reference = {
  // --- Micro-entreprise ------------------------------------------------------
  "micro.plafondVente": {
    value: 203_100,
    unit: "eur-ht",
    label: "Plafond de chiffre d’affaires micro-entreprise, vente de marchandises (2026-2028)",
    source: SOURCES.urssaf,
    checkedAt: SPEC_CHECK,
    validUntil: "2028-12-31",
    note: SPEC_NOTE,
    status: "verifie",
  },
  "micro.plafondServices": {
    value: 83_600,
    unit: "eur-ht",
    label: "Plafond de chiffre d’affaires micro-entreprise, prestations de services (2026-2028)",
    source: SOURCES.urssaf,
    checkedAt: SPEC_CHECK,
    validUntil: "2028-12-31",
    note: SPEC_NOTE,
    status: "verifie",
  },
  "micro.tauxCotisationsVente": {
    value: null,
    unit: "percent",
    label: "Taux de cotisations sociales micro-entreprise, vente de marchandises",
    source: SOURCES.urssaf,
    checkedAt: SPEC_CHECK,
    note: "Taux à relever sur urssaf.fr.",
    status: "a-verifier",
  },
  "micro.tauxCotisationsServices": {
    value: null,
    unit: "percent",
    label: "Taux de cotisations sociales micro-entreprise, prestations de services (BIC)",
    source: SOURCES.urssaf,
    checkedAt: SPEC_CHECK,
    note: "Taux à relever sur urssaf.fr.",
    status: "a-verifier",
  },

  "micro.tauxVersementLiberatoireVente": {
    value: null,
    unit: "percent",
    label: "Taux du versement libératoire de l’impôt sur le revenu, vente de marchandises",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: "Taux à relever sur impots.gouv.fr ou urssaf.fr.",
    status: "a-verifier",
  },
  "micro.tauxVersementLiberatoireServices": {
    value: null,
    unit: "percent",
    label: "Taux du versement libératoire de l’impôt sur le revenu, prestations de services (BIC)",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: "Taux à relever sur impots.gouv.fr ou urssaf.fr.",
    status: "a-verifier",
  },

  // --- TVA -------------------------------------------------------------------
  "tva.tauxNormal": {
    value: 20,
    unit: "percent",
    label: "Taux normal de TVA",
    source: SOURCES.impots,
    checkedAt: "2026-09-29",
    note: "Taux en vigueur en France métropolitaine.",
    status: "verifie",
  },
  "tva.tauxIntermediaire": {
    value: 10,
    unit: "percent",
    label: "Taux intermédiaire de TVA",
    source: SOURCES.impots,
    checkedAt: "2026-09-29",
    status: "verifie",
  },
  "tva.tauxReduit": {
    value: 5.5,
    unit: "percent",
    label: "Taux réduit de TVA",
    source: SOURCES.impots,
    checkedAt: "2026-09-29",
    status: "verifie",
  },
  "tva.tauxParticulier": {
    value: 2.1,
    unit: "percent",
    label: "Taux particulier de TVA",
    source: SOURCES.impots,
    checkedAt: "2026-09-29",
    status: "verifie",
  },
  "tva.franchiseVentes": {
    value: 85_000,
    unit: "eur",
    label: "Seuil de franchise en base de TVA, ventes",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: SPEC_NOTE,
    status: "verifie",
  },
  "tva.franchiseVentesMajore": {
    value: 93_500,
    unit: "eur",
    label: "Seuil majoré de franchise en base de TVA, ventes",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: SPEC_NOTE,
    status: "verifie",
  },
  "tva.franchiseServices": {
    value: 37_500,
    unit: "eur",
    label: "Seuil de franchise en base de TVA, prestations de services",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: SPEC_NOTE,
    status: "verifie",
  },
  "tva.franchiseServicesMajore": {
    value: 41_250,
    unit: "eur",
    label: "Seuil majoré de franchise en base de TVA, prestations de services",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: SPEC_NOTE,
    status: "verifie",
  },
  "tva.mentionFranchise": {
    value: "TVA non applicable, art. 293 B du CGI",
    unit: "text",
    label: "Mention obligatoire sur les factures en franchise en base",
    source: SOURCES.cgi293B,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "tva.seuilVentesDistanceUE": {
    value: 10_000,
    unit: "eur",
    label: "Seuil annuel des ventes à distance intra-UE (guichet unique OSS)",
    source: SOURCES.impots,
    checkedAt: SPEC_CHECK,
    note: "Marqué [À VÉRIFIER] dans le cahier des charges.",
    status: "a-verifier",
  },

  // --- Consommation ----------------------------------------------------------
  "conso.delaiRetractation": {
    value: 14,
    unit: "days",
    label: "Délai du droit de rétractation",
    source: SOURCES.codeConso,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "conso.delaiRemboursement": {
    value: 14,
    unit: "days",
    label:
      "Délai maximal de remboursement après une rétractation (à compter de l’information du vendeur)",
    source: SOURCES.codeConso,
    checkedAt: SPEC_CHECK,
    note: "Art. L221-24 du Code de la consommation, à reconfirmer sur Légifrance.",
    status: "a-verifier",
  },
  "conso.prolongationDefautInformation": {
    value: 12,
    unit: "months",
    label: "Prolongation du délai de rétractation si le client n’a pas été informé de ce droit",
    source: SOURCES.codeConso,
    checkedAt: SPEC_CHECK,
    note: "Art. L221-20 du Code de la consommation, à reconfirmer sur Légifrance.",
    status: "a-verifier",
  },
  "conso.fonctionRetractationDate": {
    value: "2026-06-19",
    unit: "date",
    label: "Fonction de rétractation en ligne obligatoire depuis le",
    source: SOURCES.ordonnance2026,
    checkedAt: SPEC_CHECK,
    note: "Transposition de la directive (UE) 2023/2673. Référence de l’ordonnance et de l’article à confirmer sur Légifrance.",
    status: "a-verifier",
  },

  // --- Sécurité des produits, facturation, influence ---------------------------------
  "gpsr.dateApplication": {
    value: "2024-12-13",
    unit: "date",
    label: "Application du règlement sur la sécurité générale des produits (GPSR)",
    source: SOURCES.gpsr,
    checkedAt: SPEC_CHECK,
    note: "À reconfirmer sur EUR-Lex.",
    status: "a-verifier",
  },
  "factureElec.receptionDate": {
    value: "2026-09-01",
    unit: "date",
    label:
      "Obligation de pouvoir recevoir des factures électroniques, pour toutes les entreprises assujetties à la TVA",
    source: SOURCES.impotsFacturation,
    checkedAt: SPEC_CHECK,
    note: "Calendrier marqué [À VÉRIFIER] dans le cahier des charges.",
    status: "a-verifier",
  },
  "factureElec.emissionPmeDate": {
    value: "2027-09-01",
    unit: "date",
    label:
      "Obligation d’émettre des factures électroniques et de transmettre les données (e-reporting) pour les PME et micro-entreprises",
    source: SOURCES.impotsFacturation,
    checkedAt: SPEC_CHECK,
    note: "Calendrier marqué [À VÉRIFIER] dans le cahier des charges.",
    status: "a-verifier",
  },
  "influence.loi": {
    value: "Loi n° 2023-451 du 9 juin 2023",
    unit: "text",
    label: "Loi encadrant l’influence commerciale et les influenceurs",
    source: SOURCES.loiInfluence,
    checkedAt: SPEC_CHECK,
    note: "Référence et lien à reconfirmer sur Légifrance.",
    status: "a-verifier",
  },

  // --- Données personnelles et traceurs -------------------------------------------
  "rgpd.conservationPiecesComptables": {
    value: 10,
    unit: "years",
    label: "Durée de conservation des pièces comptables (factures)",
    source: SOURCES.codeCommerce,
    checkedAt: SPEC_CHECK,
    note: "Art. L123-22 du Code de commerce, à reconfirmer sur Légifrance.",
    status: "a-verifier",
  },
  "cnil.dureeChoixCookies": {
    value: 6,
    unit: "months",
    label: "Durée au terme de laquelle le choix sur les traceurs est à nouveau demandé",
    source: SOURCES.cnilCookies,
    checkedAt: SPEC_CHECK,
    note: SPEC_NOTE,
    status: "verifie",
  },

  // --- Accessibilité -----------------------------------------------------------
  "eaa.dateApplication": {
    value: "2025-06-28",
    unit: "date",
    label: "Application de l’European Accessibility Act",
    source: SOURCES.decret2023_931,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "eaa.exemptionMicro": {
    value:
      "moins de 10 salariés et chiffre d’affaires annuel ou total du bilan n’excédant pas 2 M€",
    unit: "text",
    label: "Exemption des microentreprises (services)",
    source: SOURCES.directive2019_882,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },

  // --- Marché (Fevad) ----------------------------------------------------------
  "fevad.caTotal2025": {
    value: 196.4,
    unit: "md-eur",
    label: "Chiffre d’affaires du e-commerce en France en 2025",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.croissance2025": {
    value: 7,
    unit: "percent-change",
    label: "Évolution du chiffre d’affaires du e-commerce en 2025",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.transactions2025": {
    value: 3.2,
    unit: "milliards",
    label: "Nombre de transactions en ligne en 2025",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.cyberacheteurs": {
    value: 42.2,
    unit: "millions",
    label: "Nombre de cyberacheteurs en France",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.sitesMarchands": {
    value: 158_000,
    unit: "count",
    qualifier: "plus de",
    label: "Nombre de sites marchands actifs",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.panierMoyen2025": {
    value: 62,
    unit: "eur",
    label: "Panier moyen en ligne en 2025",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.panierMoyenEvolution2025": {
    value: -3,
    unit: "percent-change",
    label: "Évolution du panier moyen en 2025",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
  "fevad.partMarketplaces2025": {
    value: 32,
    unit: "percent",
    label: "Part des marketplaces dans le volume d’affaires des ventes de produits",
    source: SOURCES.fevad2025,
    checkedAt: SPEC_CHECK,
    status: "verifie",
  },
} as const satisfies Record<string, RefValue>;

export type RefKey = keyof typeof reference;

export function getRef(key: RefKey): RefValue {
  return reference[key];
}

export function isRefKey(key: string): key is RefKey {
  return Object.hasOwn(reference, key);
}

const NNBSP = " ";

function formatNumber(n: number, maxFractionDigits = 1): string {
  // fr-FR groups thousands with U+202F (narrow no-break space).
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: maxFractionDigits }).format(n);
}

/** Formats a reference value for display, following French typography. */
export function formatRef(ref: RefValue): string {
  const { value, unit } = ref;
  if (value === null) return "[À VÉRIFIER]";
  if (typeof value === "string") {
    if (unit === "date") {
      return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(value),
      );
    }
    return value;
  }
  const n = formatNumber(Math.abs(value));
  const sign = value < 0 ? "-" : unit === "percent-change" ? "+" : "";
  const text = (() => {
    switch (unit) {
      case "eur":
        return `${n}${NNBSP}€`;
      case "eur-ht":
        return `${n}${NNBSP}€ HT`;
      case "md-eur":
        return `${n}${NNBSP}Md€`;
      case "percent":
      case "percent-change":
        return `${sign}${n}${NNBSP}%`;
      case "days":
        return `${n}${NNBSP}jours`;
      case "months":
        return `${n}${NNBSP}mois`;
      case "years":
        return `${n}${NNBSP}ans`;
      case "millions":
        return `${n}${NNBSP}millions`;
      case "milliards":
        return `${n}${NNBSP}milliards`;
      default:
        return n;
    }
  })();
  return ref.qualifier ? `${ref.qualifier} ${text}` : text;
}

/** "sept. 2026" */
export function formatCheckedAtShort(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** "septembre 2026" */
export function formatCheckedAt(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** Months elapsed between `checkedAt` and `now`. */
export function monthsSince(date: string, now: Date = new Date()): number {
  const d = new Date(date);
  return (now.getUTCFullYear() - d.getUTCFullYear()) * 12 + (now.getUTCMonth() - d.getUTCMonth());
}

/**
 * Replaces `{{key}}` placeholders in plain-text content (frontmatter answers, FAQ)
 * with formatted reference values. Unknown keys throw so typos fail the build.
 */
export function interpolateRefs(text: string): string {
  return text.replace(/\{\{([\w.]+)\}\}/g, (_, key: string) => {
    if (!isRefKey(key)) throw new Error(`Unknown reference "${key}" in: ${text.slice(0, 60)}…`);
    return formatRef(getRef(key));
  });
}
