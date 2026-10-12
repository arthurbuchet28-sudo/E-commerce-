import type { Question } from '@/types/question';
import { melanger, piocher, type Rng } from '@/engine/random';
import type { Pays } from '../wikidata/requetes';
import { distracteursCredibles, niveauSelonRang } from './outils';

export type Departement = { code: string; nom: string; prefecture: string; region: string };

/** Ressemblance entre pays : même continent avant tout. */
function voisins(p: Pays) {
  return (c: Pays) => c.continents.filter((x) => p.continents.includes(x)).length * 3 + (Math.abs(c.notoriete - p.notoriete) < 60 ? 1 : 0);
}

export type GenreQuestionPays = 'drapeau' | 'capitale' | 'capitaleInverse' | 'monnaie' | 'population';

/**
 * Question sur un pays. `urlDrapeau` fournit l'image du drapeau (fichiers locaux, donc jouable hors ligne).
 */
export function questionPays(
  p: Pays,
  tous: readonly Pays[],
  genre: GenreQuestionPays,
  rng: Rng,
  urlDrapeau: (iso2: string) => string | undefined,
): Question | null {
  const rang = tous.indexOf(p);
  const autres = tous.filter((x) => x.iso2 !== p.iso2);
  const base = { source: 'pays', categorie: 'geographie' as const };
  const capitale = p.capitales.length === 1 ? p.capitales[0] : undefined;
  const infos = [
    capitale && `capitale : ${capitale}`,
    p.population && `${(p.population / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} millions d'habitants`,
    p.monnaies.length === 1 && `monnaie : ${p.monnaies[0]}`,
  ].filter(Boolean);
  const anecdote = `${p.nom}${infos.length ? ` — ${infos.join(', ')}` : ''}.`;

  switch (genre) {
    case 'drapeau': {
      const image = urlDrapeau(p.iso2);
      if (!image) return null;
      return {
        ...base,
        id: `pays-${p.iso2}-drapeau`,
        type: 'image',
        difficulte: niveauSelonRang(rang, tous.length),
        enonce: 'À quel pays appartient ce drapeau ?',
        choix: [p.nom, ...distracteursCredibles(p, autres, 5, voisins(p), (x) => x.nom, rng)],
        bonneReponse: p.nom,
        reponsesAcceptees: [],
        media: { image, alt: 'Drapeau à identifier' },
        anecdote,
      };
    }
    case 'capitale': {
      if (!capitale) return null;
      const candidats = autres.filter((x) => x.capitales.length === 1);
      return {
        ...base,
        id: `pays-${p.iso2}-capitale`,
        type: 'qcm',
        difficulte: niveauSelonRang(rang, tous.length),
        enonce: `Quelle est la capitale de ce pays : ${p.nom} ?`,
        choix: [capitale, ...distracteursCredibles(p, candidats, 5, voisins(p), (x) => x.capitales[0]!, rng)],
        bonneReponse: capitale,
        reponsesAcceptees: [],
        anecdote,
      };
    }
    case 'capitaleInverse': {
      if (!capitale) return null;
      return {
        ...base,
        id: `pays-${p.iso2}-capitale-inverse`,
        type: 'qcm',
        difficulte: niveauSelonRang(rang, tous.length, 1),
        enonce: `${capitale} est la capitale de quel pays ?`,
        choix: [p.nom, ...distracteursCredibles(p, autres, 5, voisins(p), (x) => x.nom, rng)],
        bonneReponse: p.nom,
        reponsesAcceptees: [],
        anecdote,
      };
    }
    case 'monnaie': {
      if (p.monnaies.length !== 1) return null;
      const monnaie = p.monnaies[0]!;
      const candidats = autres.filter((x) => x.monnaies.length === 1 && x.monnaies[0] !== monnaie);
      return {
        ...base,
        id: `pays-${p.iso2}-monnaie`,
        type: 'qcm',
        difficulte: niveauSelonRang(rang, tous.length, 1),
        enonce: `Quelle est la monnaie officielle de ce pays : ${p.nom} ?`,
        choix: [monnaie, ...distracteursCredibles(p, candidats, 5, voisins(p), (x) => x.monnaies[0]!, rng)],
        bonneReponse: monnaie,
        anecdote,
      };
    }
    case 'population': {
      if (!p.population || p.population < 1_000_000) return null;
      const millions = Math.round(p.population / 1e5) / 10;
      return {
        ...base,
        id: `pays-${p.iso2}-population`,
        type: 'estimation',
        difficulte: niveauSelonRang(rang, tous.length, 1),
        enonce: `Combien d'habitants compte ce pays : ${p.nom} ? (en millions)`,
        bonneReponse: millions,
        estimation: { marge: Math.max(2, millions * 0.5), unite: "millions d'habitants" },
        anecdote,
      };
    }
  }
}

const GENRES_PAYS: GenreQuestionPays[] = ['drapeau', 'drapeau', 'capitale', 'capitale', 'capitaleInverse', 'monnaie', 'population'];

export function genererQuestionsPays(tous: readonly Pays[], nombre: number, rng: Rng, urlDrapeau: (iso2: string) => string | undefined): Question[] {
  const resultat: Question[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < nombre * 4 && resultat.length < nombre; i++) {
    const q = questionPays(piocher(tous, rng), tous, piocher(GENRES_PAYS, rng), rng, urlDrapeau);
    if (q && !ids.has(q.id)) {
      ids.add(q.id);
      resultat.push(q);
    }
  }
  return resultat;
}

// --- Départements français ----------------------------------------------

/** Préfectures et numéros les plus connus : questions plus faciles. */
const GRANDES_VILLES = new Set(['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Grenoble', 'Rouen', 'Toulon', 'Dijon', 'Ajaccio', 'Bastia', 'Orléans', 'Tours', 'Caen']);
const NUMEROS_CONNUS = new Set(['75', '13', '69', '33', '59', '06', '31', '67', '44', '2A', '2B', '974']);

export type GenreQuestionDepartement = 'prefecture' | 'numero' | 'numeroInverse' | 'region';

export function questionDepartement(d: Departement, tous: readonly Departement[], genre: GenreQuestionDepartement, rng: Rng): Question {
  const autres = tous.filter((x) => x.code !== d.code);
  const memeRegion = (c: Departement) => (c.region === d.region ? 3 : 0) + rng();
  const base = {
    source: 'departements',
    categorie: 'geographie' as const,
    anecdote: `${d.nom} (${d.code}) — préfecture : ${d.prefecture}, région ${d.region}.`,
  };
  const facile = GRANDES_VILLES.has(d.prefecture);
  switch (genre) {
    case 'prefecture':
      return {
        ...base,
        id: `dep-${d.code}-prefecture`,
        type: 'qcm',
        difficulte: d.nom === d.prefecture ? 1 : facile ? 2 : rng() < 0.5 ? 3 : 4,
        enonce: `Quelle est la préfecture du département ${d.nom} ?`,
        choix: [d.prefecture, ...distracteursCredibles(d, autres, 5, memeRegion, (x) => x.prefecture, rng)],
        bonneReponse: d.prefecture,
        reponsesAcceptees: [],
      };
    case 'numero': {
      // Numéros voisins : les plus crédibles.
      const proche = (c: Departement) => -Math.abs((Number.parseInt(c.code, 10) || 20) - (Number.parseInt(d.code, 10) || 20));
      return {
        ...base,
        id: `dep-${d.code}-numero`,
        type: 'qcm',
        difficulte: NUMEROS_CONNUS.has(d.code) ? 2 : 3,
        enonce: `Quel département porte le numéro ${d.code} ?`,
        choix: [d.nom, ...distracteursCredibles(d, autres, 5, proche, (x) => x.nom, rng)],
        bonneReponse: d.nom,
      };
    }
    case 'numeroInverse':
      return {
        ...base,
        id: `dep-${d.code}-numero-inverse`,
        type: 'saisie',
        difficulte: NUMEROS_CONNUS.has(d.code) ? 2 : 4,
        enonce: `Quel est le numéro du département ${d.nom} ?`,
        bonneReponse: d.code,
        reponsesAcceptees: d.code.startsWith('0') ? [d.code.slice(1)] : [],
      };
    case 'region': {
      const regions = [...new Set(autres.map((x) => x.region).filter((r) => r !== d.region))];
      return {
        ...base,
        id: `dep-${d.code}-region`,
        type: 'qcm',
        difficulte: facile ? 2 : 3,
        enonce: `Dans quelle région se trouve le département ${d.nom} ?`,
        choix: [d.region, ...melanger(regions, rng).slice(0, 5)],
        bonneReponse: d.region,
      };
    }
  }
}

const GENRES_DEP: GenreQuestionDepartement[] = ['prefecture', 'prefecture', 'numero', 'numeroInverse', 'region'];

export function genererQuestionsDepartements(tous: readonly Departement[], nombre: number, rng: Rng): Question[] {
  return melanger(tous, rng)
    .slice(0, nombre)
    .map((d) => questionDepartement(d, tous, piocher(GENRES_DEP, rng), rng));
}
