import type { Categorie, Question } from '@/types/question';
import { piocher, type Rng } from '@/engine/random';
import { LIBELLES_DOMAINES, type DomaineId, type Personne } from '../wikidata/requetes';
import { accord, anneesProches, distracteursCredibles, niveauSelonRang, variantesNom } from './outils';

/** Catégorie de jeu d'une personnalité selon son domaine principal. */
export function categoriePersonne(p: Personne): Categorie {
  if (p.domaines[0] === 'sport') return 'sport';
  if (p.domaines[0] === 'cinema') return 'cinema_series';
  return 'personnalites';
}

function partageDomaine(a: Personne, b: Personne) {
  return a.domaines.some((d) => b.domaines.includes(d));
}

/** Ressemblance pour des distracteurs crédibles : même domaine, même époque, même genre, même pays. */
function ressemblance(cible: Personne) {
  return (c: Personne) =>
    (partageDomaine(cible, c) ? 4 : 0) +
    Math.max(0, 3 - Math.abs(c.naissance - cible.naissance) / 25) +
    (c.genre === cible.genre ? 1.5 : 0) +
    (c.paysNaissance && c.paysNaissance === cible.paysNaissance ? 1 : 0);
}

function vie(p: Personne) {
  return p.deces ? `${p.naissance}-${p.deces}` : `né${p.genre === 'f' ? 'e' : ''} en ${p.naissance}`;
}

function anecdote(p: Personne) {
  const domaines = p.domaines.map((d) => LIBELLES_DOMAINES[d]).join(', ');
  const origine = p.paysNaissance ? ` Pays de naissance (frontières actuelles) : ${p.paysNaissance}.` : '';
  return `${p.nom} (${vie(p)}) — ${domaines}.${origine}`;
}

export type GenreQuestionPersonne = 'photo' | 'naissance' | 'pays' | 'domaine' | 'avant';

/** Génère une question sur une personnalité. */
export function questionPersonne(p: Personne, tous: readonly Personne[], genre: GenreQuestionPersonne, rng: Rng): Question | null {
  const rang = tous.indexOf(p);
  const autres = tous.filter((x) => x.id !== p.id);
  const base = {
    source: 'wikidata',
    categorie: categoriePersonne(p),
    anecdote: anecdote(p),
  };
  switch (genre) {
    case 'photo':
      return {
        ...base,
        id: `wd-${p.id}-photo`,
        type: 'image',
        difficulte: niveauSelonRang(rang, tous.length),
        enonce: 'Qui est cette personne ?',
        choix: [p.nom, ...distracteursCredibles(p, autres, 5, ressemblance(p), (x) => x.nom, rng)],
        bonneReponse: p.nom,
        reponsesAcceptees: variantesNom(p.nom),
        media: { image: p.image, credit: p.credit, alt: 'Portrait d’une personnalité à identifier' },
      };
    case 'naissance':
      if (p.naissance <= 0 || !p.naissancePrecise) return null;
      return {
        ...base,
        id: `wd-${p.id}-naissance`,
        type: rng() < 0.5 ? 'estimation' : 'qcm',
        difficulte: niveauSelonRang(rang, tous.length, 1),
        enonce: `En quelle année est ${accord(p.genre, 'né', 'née')} ${p.nom} ?`,
        estimation: { marge: p.naissance < 1500 ? 60 : 25 },
        choix: [String(p.naissance), ...anneesProches(p.naissance, 5, rng, p.naissance < 1500 ? 15 : 4)],
        bonneReponse: p.naissance,
      };
    case 'pays': {
      if (!p.paysNaissance) return null;
      const pays = [...new Set(autres.map((x) => x.paysNaissance).filter((x): x is string => !!x && x !== p.paysNaissance))];
      if (pays.length < 5) return null;
      return {
        ...base,
        id: `wd-${p.id}-pays`,
        type: 'qcm',
        difficulte: niveauSelonRang(rang, tous.length, 1),
        enonce: `Dans quel pays actuel est ${accord(p.genre, 'né', 'née')} ${p.nom} ?`,
        choix: [p.paysNaissance, ...distracteursCredibles(p.paysNaissance, pays, 5, () => 0, (x) => x, rng)],
        bonneReponse: p.paysNaissance,
      };
    }
    case 'domaine': {
      const libelles = (Object.keys(LIBELLES_DOMAINES) as DomaineId[]).filter((d) => !p.domaines.includes(d)).map((d) => LIBELLES_DOMAINES[d]);
      const bonne = LIBELLES_DOMAINES[p.domaines[0]!];
      return {
        ...base,
        id: `wd-${p.id}-domaine`,
        type: 'qcm',
        difficulte: niveauSelonRang(rang, tous.length, -1),
        enonce: `Dans quel domaine ${p.nom} s'est-${accord(p.genre, 'il', 'elle', 'il')} ${accord(p.genre, 'illustré', 'illustrée')} ?`,
        choix: [bonne, ...distracteursCredibles(bonne, libelles, 5, () => 0, (x) => x, rng)],
        bonneReponse: bonne,
      };
    }
    case 'avant': {
      const proches = autres.filter((x) => Math.abs(x.naissance - p.naissance) >= 5 && Math.abs(x.naissance - p.naissance) <= 80);
      if (!proches.length) return null;
      const autre = piocher(proches, rng);
      const vrai = p.naissance < autre.naissance;
      return {
        ...base,
        id: `wd-${p.id}-avant-${autre.id}`,
        type: 'vrai_faux',
        difficulte: niveauSelonRang(rang, tous.length, 1),
        enonce: `${p.nom} est ${accord(p.genre, 'né', 'née')} avant ${autre.nom}.`,
        choix: ['Vrai', 'Faux'],
        bonneReponse: vrai ? 'Vrai' : 'Faux',
        anecdote: `${p.nom} : ${p.naissance} ; ${autre.nom} : ${autre.naissance}.`,
      };
    }
  }
}

const GENRES: GenreQuestionPersonne[] = ['photo', 'photo', 'photo', 'naissance', 'pays', 'domaine', 'avant'];

/** Génère `nombre` questions variées, en piochant parmi les personnalités de la catégorie demandée. */
export function genererQuestionsPersonnes(tous: readonly Personne[], categorie: Categorie | 'mix', nombre: number, rng: Rng): Question[] {
  const vivier = tous.filter((p) => categorie === 'mix' || categoriePersonne(p) === categorie);
  const resultat: Question[] = [];
  const utilises = new Set<string>();
  for (let essai = 0; essai < nombre * 4 && resultat.length < nombre && vivier.length; essai++) {
    const p = piocher(vivier, rng);
    if (utilises.has(p.id)) continue;
    const q = questionPersonne(p, tous, piocher(GENRES, rng), rng);
    if (!q) continue;
    utilises.add(p.id);
    resultat.push(q);
  }
  return resultat;
}
