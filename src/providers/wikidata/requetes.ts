/**
 * Requêtes SPARQL Wikidata et normalisation de leurs résultats.
 * Partagé entre le script de génération (Node) et le rafraîchissement dans le navigateur.
 */

export type LigneSparql = Record<string, { type: string; value: string } | undefined>;

export type DomaineId =
  | 'peinture'
  | 'musique'
  | 'cinema'
  | 'sciences'
  | 'litterature'
  | 'politique'
  | 'sport'
  | 'philosophie'
  | 'exploration';

/** Domaines d'activité, et libellé utilisé dans les questions. */
export const LIBELLES_DOMAINES: Record<DomaineId, string> = {
  peinture: 'Peinture et sculpture',
  musique: 'Musique',
  cinema: 'Cinéma',
  sciences: 'Sciences',
  litterature: 'Littérature',
  politique: 'Politique',
  sport: 'Sport',
  philosophie: 'Philosophie',
  exploration: 'Exploration et aventure',
};

/**
 * Occupations Wikidata (P106) de chaque domaine, et seuil de notoriété :
 * nombre minimal de Wikipédias ayant un article (sitelinks), pour ne garder que des personnes très connues.
 */
export const DOMAINES: { id: DomaineId; occupations: string[]; seuil: number; limite: number }[] = [
  { id: 'peinture', occupations: ['Q1028181', 'Q1281618'], seuil: 90, limite: 60 },
  { id: 'musique', occupations: ['Q177220', 'Q36834'], seuil: 110, limite: 80 },
  { id: 'cinema', occupations: ['Q33999', 'Q2526255'], seuil: 110, limite: 80 },
  { id: 'sciences', occupations: ['Q901', 'Q169470', 'Q593644', 'Q170790', 'Q205375', 'Q11063'], seuil: 110, limite: 70 },
  { id: 'litterature', occupations: ['Q36180', 'Q49757', 'Q214917'], seuil: 120, limite: 70 },
  { id: 'politique', occupations: ['Q82955'], seuil: 150, limite: 80 },
  { id: 'sport', occupations: ['Q937857', 'Q10833314', 'Q3665646', 'Q378622', 'Q11513337', 'Q2309784'], seuil: 80, limite: 70 },
  { id: 'philosophie', occupations: ['Q4964182'], seuil: 110, limite: 40 },
  { id: 'exploration', occupations: ['Q11900058', 'Q11631'], seuil: 70, limite: 30 },
];

const LABEL_FR = (variable: string, entite: string) => `${entite} rdfs:label ${variable} . FILTER(LANG(${variable}) = "fr")`;

export function requetePersonnes(occupations: string[], seuil: number, limite: number): string {
  return `SELECT ?p ?nom ?sl (SAMPLE(?img) AS ?image) (MIN(?naissance) AS ?nais) (MAX(?precision) AS ?precNais) (MIN(?mort) AS ?deces) (SAMPLE(?genre) AS ?g) (SAMPLE(?paysNom) AS ?pays) WHERE {
  VALUES ?occ { ${occupations.map((o) => `wd:${o}`).join(' ')} }
  ?p wdt:P106 ?occ ; wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl ; wdt:P18 ?img ; wdt:P569 ?naissance .
  FILTER(?sl >= ${seuil})
  ${LABEL_FR('?nom', '?p')}
  OPTIONAL { ?p p:P569/psv:P569/wikibase:timePrecision ?precision }
  OPTIONAL { ?p wdt:P570 ?mort }
  OPTIONAL { ?p wdt:P21 ?genre }
  OPTIONAL { ?p wdt:P19/wdt:P17 ?paysN . ${LABEL_FR('?paysNom', '?paysN')} }
} GROUP BY ?p ?nom ?sl ORDER BY DESC(?sl) LIMIT ${limite}`;
}

const TYPES_MONUMENTS = [
  'Q12518', // tour
  'Q4989906', // monument
  'Q179700', // statue
  'Q16560', // palais
  'Q23413', // château
  'Q2977', // cathédrale
  'Q12280', // pont
  'Q44539', // temple
  'Q839954', // site archéologique
  'Q57821', // fortification
  'Q1081138', // site historique
  'Q16970', // église
  'Q32815', // mosquée
  'Q12516', // pyramide
  'Q1440300', // tour d'observation
];

export function requeteMonuments(): string {
  return `SELECT ?m ?nom ?sl (SAMPLE(?img) AS ?image) (SAMPLE(?paysNom) AS ?pays) WHERE {
  VALUES ?t { ${TYPES_MONUMENTS.map((t) => `wd:${t}`).join(' ')} }
  ?m wdt:P31 ?t ; wikibase:sitelinks ?sl ; wdt:P18 ?img ; wdt:P17 ?paysE .
  FILTER(?sl >= 55)
  ${LABEL_FR('?nom', '?m')}
  ${LABEL_FR('?paysNom', '?paysE')}
} GROUP BY ?m ?nom ?sl ORDER BY DESC(?sl) LIMIT 150`;
}

const TYPES_EVENEMENTS = [
  'Q178561', // bataille
  'Q198', // guerre
  'Q131569', // traité
  'Q10931', // révolution
  'Q3839081', // catastrophe
  'Q8065', // catastrophe naturelle
  'Q2223653', // attentat
  'Q645883', // opération militaire
  'Q124757', // émeute
  'Q625994', // convention
  'Q1190554', // événement
  'Q2001676', // crise
];

export function requeteEvenements(): string {
  return `SELECT ?e ?nom ?sl (MIN(?point) AS ?date) (MIN(?debut) AS ?commence) WHERE {
  VALUES ?t { ${TYPES_EVENEMENTS.map((t) => `wd:${t}`).join(' ')} }
  ?e wdt:P31 ?t ; wikibase:sitelinks ?sl .
  FILTER(?sl >= 50)
  # Seules les dates précises au moins à l'année (précision ≥ 9) : pas de « années 1970 ».
  OPTIONAL { ?e p:P585/psv:P585 [ wikibase:timeValue ?point ; wikibase:timePrecision ?pp ] . FILTER(?pp >= 9) }
  OPTIONAL { ?e p:P580/psv:P580 [ wikibase:timeValue ?debut ; wikibase:timePrecision ?pd ] . FILTER(?pd >= 9) }
  FILTER(BOUND(?point) || BOUND(?debut))
  ${LABEL_FR('?nom', '?e')}
} GROUP BY ?e ?nom ?sl ORDER BY DESC(?sl) LIMIT 250`;
}

export function requetePays(): string {
  return `SELECT ?c ?nom ?iso ?sl (GROUP_CONCAT(DISTINCT ?capNom; separator="|") AS ?capitales) (MAX(?pop) AS ?population)
  (GROUP_CONCAT(DISTINCT ?monNom; separator="|") AS ?monnaies) (GROUP_CONCAT(DISTINCT ?contNom; separator="|") AS ?continents) WHERE {
  ?c wdt:P31 wd:Q3624078 ; wdt:P297 ?iso ; wikibase:sitelinks ?sl .
  FILTER NOT EXISTS { ?c wdt:P576 ?fin }
  ${LABEL_FR('?nom', '?c')}
  OPTIONAL { ?c wdt:P36 ?cap . ${LABEL_FR('?capNom', '?cap')} }
  OPTIONAL { ?c wdt:P1082 ?pop }
  OPTIONAL { ?c wdt:P38 ?mon . ${LABEL_FR('?monNom', '?mon')} }
  OPTIONAL { ?c wdt:P30 ?cont . ${LABEL_FR('?contNom', '?cont')} }
} GROUP BY ?c ?nom ?iso ?sl`;
}

// --- Normalisation -------------------------------------------------------

export type Personne = {
  id: string;
  nom: string;
  notoriete: number;
  naissance: number;
  /** La date de naissance est connue à l'année près (sinon : pas de question sur l'année). */
  naissancePrecise: boolean;
  deces?: number;
  genre: 'f' | 'm' | null;
  paysNaissance?: string;
  domaines: DomaineId[];
  image: string;
  credit: string;
};

export type Monument = { id: string; nom: string; notoriete: number; pays: string; image: string; credit: string };

export type Evenement = { id: string; nom: string; notoriete: number; annee: number; ponctuel: boolean };

export type Pays = {
  iso2: string;
  nom: string;
  notoriete: number;
  capitales: string[];
  population?: number;
  monnaies: string[];
  continents: string[];
};

const v = (l: LigneSparql, k: string) => l[k]?.value;
const qid = (uri: string | undefined) => uri?.split('/').pop() ?? '';

/** « 1452-04-15T00:00:00Z » → 1452 ; « -0469-… » → -469. */
export function anneeDepuisDate(date: string | undefined): number | undefined {
  const m = date?.match(/^(-?\d+)-/);
  return m ? Number.parseInt(m[1]!, 10) : undefined;
}

/** Nom de fichier Commons depuis l'URL Special:FilePath. */
export function fichierCommons(url: string | undefined): string {
  return decodeURIComponent(url?.split('/Special:FilePath/').pop() ?? '').replace(/ /g, '_');
}

/** Première lettre en majuscule (« tour Eiffel » → « Tour Eiffel »). */
export function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Libellés Wikidata peu naturels dans une question. */
const NOMS_PAYS: Record<string, string> = {
  'république populaire de Chine': 'Chine',
  'État de Palestine': 'Palestine',
  'royaume des Pays-Bas': 'Pays-Bas',
};
/** Coquilles connues dans les libellés français de Wikidata. */
const NOMS_PERSONNES: Record<string, string> = {
  'Michel-Ange Buronarroti': 'Michel-Ange',
};

function corrigerNomPays(nom: string | undefined): string | undefined {
  return nom ? (NOMS_PAYS[nom] ?? majuscule(nom)) : undefined;
}

/** Zone euro (et micro-États ayant l'euro par accord) : Wikidata y renvoie parfois une autre monnaie « préférée ». */
const PAYS_EURO = new Set(['at', 'be', 'bg', 'hr', 'cy', 'ee', 'fi', 'fr', 'de', 'gr', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pt', 'sk', 'si', 'es', 'ad', 'mc', 'sm', 'va']);

/** Un libellé utilisable : contient des lettres, n'est pas un identifiant Q123. */
function libelleValide(nom: string | undefined): nom is string {
  return !!nom && /\p{L}/u.test(nom) && !/^Q\d+$/.test(nom);
}

export function normaliserPersonnes(lignes: LigneSparql[]): (Omit<Personne, 'image' | 'credit'> & { fichierImage: string })[] {
  const parId = new Map<string, Omit<Personne, 'image' | 'credit'> & { fichierImage: string }>();
  for (const l of lignes) {
    const id = qid(v(l, 'p'));
    const nom = v(l, 'nom');
    const naissance = anneeDepuisDate(v(l, 'nais'));
    if (!id || !libelleValide(nom) || naissance === undefined) continue;
    const domaine = v(l, 'domaine') as DomaineId | undefined;
    const existant = parId.get(id);
    if (existant) {
      if (domaine && !existant.domaines.includes(domaine)) existant.domaines.push(domaine);
      continue;
    }
    const genre = qid(v(l, 'g'));
    parId.set(id, {
      id,
      nom: NOMS_PERSONNES[nom] ?? nom,
      notoriete: Number(v(l, 'sl') ?? 0),
      naissance,
      naissancePrecise: Number(v(l, 'precNais') ?? 0) >= 9,
      deces: anneeDepuisDate(v(l, 'deces')),
      genre: genre === 'Q6581072' ? 'f' : genre === 'Q6581097' ? 'm' : null,
      paysNaissance: corrigerNomPays(v(l, 'pays')),
      domaines: domaine ? [domaine] : [],
      fichierImage: fichierCommons(v(l, 'image')),
    });
  }
  return [...parId.values()].sort((a, b) => b.notoriete - a.notoriete);
}

export function normaliserMonuments(lignes: LigneSparql[]): (Omit<Monument, 'image' | 'credit'> & { fichierImage: string })[] {
  const vus = new Set<string>();
  return lignes.flatMap((l) => {
    const id = qid(v(l, 'm'));
    const nom = v(l, 'nom');
    const pays = v(l, 'pays');
    if (!id || vus.has(id) || !libelleValide(nom) || !pays) return [];
    vus.add(id);
    return [{ id, nom: majuscule(nom), pays: corrigerNomPays(pays)!, notoriete: Number(v(l, 'sl') ?? 0), fichierImage: fichierCommons(v(l, 'image')) }];
  });
}

export function normaliserEvenements(lignes: LigneSparql[]): Evenement[] {
  const vus = new Set<string>();
  return lignes.flatMap((l) => {
    const id = qid(v(l, 'e'));
    const nom = v(l, 'nom');
    const ponctuel = !!v(l, 'date');
    const annee = anneeDepuisDate(v(l, 'date') ?? v(l, 'commence'));
    // On écarte les libellés qui donnent la réponse (« … de 1998 ») et les dates futures (valeurs fictives).
    if (!id || vus.has(id) || !libelleValide(nom) || annee === undefined || /\d{3,4}/.test(nom) || annee > new Date().getFullYear()) return [];
    vus.add(id);
    return [{ id, nom: majuscule(nom), notoriete: Number(v(l, 'sl') ?? 0), annee, ponctuel }];
  });
}

const liste = (s: string | undefined) => (s ? s.split('|').filter(Boolean) : []);

export function normaliserPays(lignes: LigneSparql[]): Pays[] {
  const vus = new Set<string>();
  return lignes
    .flatMap((l) => {
      const iso2 = v(l, 'iso')?.toLowerCase();
      const nom = v(l, 'nom');
      if (!iso2 || vus.has(iso2) || !libelleValide(nom)) return [];
      vus.add(iso2);
      const population = v(l, 'population');
      const monnaies = PAYS_EURO.has(iso2) ? ['euro'] : liste(v(l, 'monnaies')).map((m) => m.charAt(0).toLowerCase() + m.slice(1));
      return [
        {
          iso2,
          nom: corrigerNomPays(nom)!,
          notoriete: Number(v(l, 'sl') ?? 0),
          capitales: liste(v(l, 'capitales')),
          population: population ? Math.round(Number(population)) : undefined,
          monnaies,
          continents: liste(v(l, 'continents')),
        },
      ];
    })
    .sort((a, b) => b.notoriete - a.notoriete);
}
