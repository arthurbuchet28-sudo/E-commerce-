import type { Question } from '@/types/question';
import { melanger, piocher, type Rng } from '@/engine/random';
import type { Evenement, Monument } from '../wikidata/requetes';
import { anneesProches, distracteursCredibles, niveauSelonRang } from './outils';

// --- Monuments -----------------------------------------------------------

export function questionMonument(m: Monument, tous: readonly Monument[], genre: 'photo' | 'pays', rng: Rng): Question | null {
  const rang = tous.indexOf(m);
  const autres = tous.filter((x) => x.id !== m.id);
  const base = { source: 'wikidata', categorie: 'geographie' as const, anecdote: `${m.nom} — pays : ${m.pays}.` };
  if (genre === 'photo') {
    return {
      ...base,
      id: `wd-${m.id}-photo`,
      type: 'image',
      // Reconnaître un monument en photo est plus difficile que connaître son pays.
      difficulte: niveauSelonRang(rang, tous.length, 1),
      enonce: 'Quel est ce monument ?',
      // Mélange de monuments du même pays (difficile) et d'ailleurs.
      choix: [m.nom, ...distracteursCredibles(m, autres, 5, (c) => (c.pays === m.pays ? 2 : 0) + rng(), (x) => x.nom, rng)],
      bonneReponse: m.nom,
      media: { image: m.image, credit: m.credit, alt: 'Photo d’un monument à identifier' },
    };
  }
  const pays = [...new Set(autres.map((x) => x.pays).filter((x) => x !== m.pays))];
  if (pays.length < 5) return null;
  return {
    ...base,
    id: `wd-${m.id}-pays`,
    type: 'qcm',
    difficulte: niveauSelonRang(rang, tous.length),
    enonce: `Dans quel pays se trouve ce monument : ${m.nom} ?`,
    choix: [m.pays, ...distracteursCredibles(m.pays, pays, 5, () => 0, (x) => x, rng)],
    bonneReponse: m.pays,
    reponsesAcceptees: [],
  };
}

export function genererQuestionsMonuments(tous: readonly Monument[], nombre: number, rng: Rng): Question[] {
  return melanger(tous, rng)
    .slice(0, nombre * 2)
    .map((m) => questionMonument(m, tous, rng() < 0.7 ? 'photo' : 'pays', rng))
    .filter((q): q is Question => q !== null)
    .slice(0, nombre);
}

// --- Événements ----------------------------------------------------------

function margeAnnee(annee: number) {
  return annee < 1500 ? 50 : annee < 1900 ? 25 : 15;
}

export function questionAnneeEvenement(e: Evenement, tous: readonly Evenement[], rng: Rng): Question {
  const rang = tous.indexOf(e);
  const verbe = e.ponctuel ? 'a eu lieu' : 'a commencé';
  const estimation = rng() < 0.5;
  return {
    id: `wd-${e.id}-annee`,
    source: 'wikidata',
    categorie: 'histoire',
    type: estimation ? 'estimation' : 'qcm',
    difficulte: niveauSelonRang(rang, tous.length, estimation ? 1 : 0),
    enonce: `En quelle année ${verbe} l'événement « ${e.nom} » ?`,
    choix: [String(e.annee), ...anneesProches(e.annee, 5, rng, e.annee < 1500 ? 20 : 4)],
    bonneReponse: e.annee,
    estimation: { marge: margeAnnee(e.annee) },
    anecdote: `${e.nom} : ${e.annee}.`,
  };
}

/** Chronologie : 4 événements dont les années sont bien distinctes (au moins 3 ans d'écart). */
export function questionChronologie(tous: readonly Evenement[], rng: Rng, taille = 4): Question | null {
  const choisis: Evenement[] = [];
  for (const e of melanger(tous, rng)) {
    if (choisis.every((c) => Math.abs(c.annee - e.annee) >= 3)) choisis.push(e);
    if (choisis.length === taille) break;
  }
  if (choisis.length < taille) return null;
  const ordre = [...choisis].sort((a, b) => a.annee - b.annee);
  const rangMoyen = choisis.reduce((s, e) => s + tous.indexOf(e), 0) / taille;
  return {
    id: `wd-chrono-${ordre.map((e) => e.id).join('-')}`,
    source: 'wikidata',
    categorie: 'histoire',
    type: 'chronologie',
    difficulte: niveauSelonRang(rangMoyen, tous.length, 1),
    enonce: 'Remettez ces événements dans l’ordre chronologique.',
    bonneReponse: ordre.map((e) => e.nom),
    anecdote: ordre.map((e) => `${e.nom} (${e.annee})`).join(' → '),
  };
}

export function genererQuestionsEvenements(tous: readonly Evenement[], nombre: number, rng: Rng): Question[] {
  const resultat: Question[] = [];
  const vivier = tous.filter((e) => e.annee > 0);
  for (let i = 0; i < nombre * 2 && resultat.length < nombre; i++) {
    if (rng() < 0.3) {
      const q = questionChronologie(vivier, rng);
      if (q) resultat.push(q);
    } else {
      resultat.push(questionAnneeEvenement(piocher(vivier, rng), vivier, rng));
    }
  }
  return resultat;
}
