import { CATEGORIES, type Categorie, type Question } from '@/types/question';
import { validerQuestion } from './validation';

/** Colonnes du CSV (séparateur « ; », listes séparées par « | »). */
export const COLONNES_CSV = [
  'id',
  'categorie',
  'type',
  'difficulte',
  'enonce',
  'choix',
  'bonneReponse',
  'reponsesAcceptees',
  'anecdote',
  'marge',
  'unite',
  'min',
  'max',
] as const;

const SEP = ';';
const SEP_LISTE = '|';

function echapper(valeur: string): string {
  return /[";\n\r]/.test(valeur) ? `"${valeur.replace(/"/g, '""')}"` : valeur;
}

/** Exporte des questions en CSV (avec BOM UTF-8 pour Excel). */
export function versCsv(questions: Question[]): string {
  const lignes = questions.map((q) => {
    const cellules: Record<(typeof COLONNES_CSV)[number], string> = {
      id: q.id,
      categorie: q.categorie,
      type: q.type,
      difficulte: String(q.difficulte),
      enonce: q.enonce,
      choix: q.type === 'chronologie' ? '' : (q.choix ?? []).join(SEP_LISTE),
      bonneReponse: Array.isArray(q.bonneReponse) ? q.bonneReponse.join(SEP_LISTE) : String(q.bonneReponse),
      reponsesAcceptees: (q.reponsesAcceptees ?? []).join(SEP_LISTE),
      anecdote: q.anecdote ?? '',
      marge: q.estimation ? String(q.estimation.marge) : '',
      unite: q.estimation?.unite ?? '',
      min: q.estimation?.min !== undefined ? String(q.estimation.min) : '',
      max: q.estimation?.max !== undefined ? String(q.estimation.max) : '',
    };
    return COLONNES_CSV.map((c) => echapper(cellules[c])).join(SEP);
  });
  return '﻿' + [COLONNES_CSV.join(SEP), ...lignes].join('\r\n') + '\r\n';
}

/** Découpe un CSV (RFC 4180 : guillemets, guillemets doublés, retours à la ligne dans une cellule). */
export function lireCsv(texte: string, separateur = SEP): string[][] {
  const t = texte.replace(/^﻿/, '');
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let cellule = '';
  let guillemets = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    if (guillemets) {
      if (c === '"' && t[i + 1] === '"') {
        cellule += '"';
        i++;
      } else if (c === '"') guillemets = false;
      else cellule += c;
    } else if (c === '"') guillemets = true;
    else if (c === separateur) {
      ligne.push(cellule);
      cellule = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      ligne.push(cellule);
      if (ligne.some((x) => x !== '')) lignes.push(ligne);
      ligne = [];
      cellule = '';
    } else cellule += c;
  }
  ligne.push(cellule);
  if (ligne.some((x) => x !== '')) lignes.push(ligne);
  return lignes;
}

export type ResultatImport = { questions: Question[]; erreurs: string[] };

const liste = (s: string | undefined) => (s ? s.split(SEP_LISTE).map((x) => x.trim()).filter(Boolean) : []);
const nombre = (s: string | undefined) => (s && s.trim() !== '' ? Number(s.replace(',', '.')) : undefined);

/** Construit une question à partir de champs texte, puis la valide. */
function questionDepuisChamps(champs: Record<string, string>, numero: number): { question?: Question; erreurs: string[] } {
  const type = champs.type as Question['type'];
  const difficulte = Number(champs.difficulte) as Question['difficulte'];
  let bonneReponse: Question['bonneReponse'] = champs.bonneReponse ?? '';
  if (type === 'chronologie') bonneReponse = liste(champs.bonneReponse);
  if (type === 'estimation') bonneReponse = nombre(champs.bonneReponse) ?? NaN;
  const q: Question = {
    id: champs.id?.trim() || `adm-${Date.now().toString(36)}-${numero}`,
    source: 'local',
    categorie: champs.categorie as Categorie,
    type,
    difficulte,
    enonce: champs.enonce?.trim() ?? '',
    bonneReponse,
    anecdote: champs.anecdote?.trim() || undefined,
  };
  const choix = type === 'vrai_faux' ? ['Vrai', 'Faux'] : liste(champs.choix);
  if (choix.length) q.choix = choix;
  const acceptees = liste(champs.reponsesAcceptees);
  if (acceptees.length) q.reponsesAcceptees = acceptees;
  if (type === 'estimation') {
    q.estimation = { marge: nombre(champs.marge) ?? 0 };
    if (champs.unite?.trim()) q.estimation.unite = champs.unite.trim();
    const min = nombre(champs.min);
    const max = nombre(champs.max);
    if (min !== undefined && max !== undefined) Object.assign(q.estimation, { min, max });
  }
  const erreurs = validerQuestion(q).map((e) => `ligne ${numero} (${q.id}) : ${e}`);
  return erreurs.length ? { erreurs } : { question: q, erreurs: [] };
}

/** Importe un CSV exporté par QuizMania (ou de même structure). Les lignes invalides sont signalées et ignorées. */
export function depuisCsv(texte: string): ResultatImport {
  const lignes = lireCsv(texte);
  if (!lignes.length) return { questions: [], erreurs: ['Fichier vide.'] };
  const entete = lignes[0]!.map((c) => c.trim());
  const manquantes = ['categorie', 'type', 'difficulte', 'enonce', 'bonneReponse'].filter((c) => !entete.includes(c));
  if (manquantes.length) return { questions: [], erreurs: [`Colonnes manquantes : ${manquantes.join(', ')}`] };
  const questions: Question[] = [];
  const erreurs: string[] = [];
  lignes.slice(1).forEach((cellules, i) => {
    const champs = Object.fromEntries(entete.map((c, j) => [c, cellules[j] ?? '']));
    const r = questionDepuisChamps(champs, i + 2);
    if (r.question) questions.push(r.question);
    erreurs.push(...r.erreurs);
  });
  return { questions, erreurs };
}

/**
 * Importe du JSON : un tableau de questions, ou un fichier de la banque
 * (`{ "categorie": "...", "questions": [...] }`), ou une liste de tels fichiers.
 */
export function depuisJson(texte: string): ResultatImport {
  let donnees: unknown;
  try {
    donnees = JSON.parse(texte);
  } catch (e) {
    return { questions: [], erreurs: [`JSON invalide : ${(e as Error).message}`] };
  }
  const brutes: Partial<Question>[] = [];
  const parcourir = (d: unknown) => {
    if (Array.isArray(d)) d.forEach(parcourir);
    else if (d && typeof d === 'object' && Array.isArray((d as { questions?: unknown }).questions)) {
      const f = d as { categorie?: Categorie; questions: Partial<Question>[] };
      f.questions.forEach((q) => brutes.push({ categorie: f.categorie, ...q }));
    } else if (d && typeof d === 'object') brutes.push(d as Partial<Question>);
  };
  parcourir(donnees);
  const questions: Question[] = [];
  const erreurs: string[] = [];
  brutes.forEach((b, i) => {
    const q = { ...b, source: 'local', id: b.id || `adm-${Date.now().toString(36)}-${i}` } as Question;
    const e = validerQuestion(q);
    if (e.length) erreurs.push(...e.map((x) => `question ${i + 1} (${q.id}) : ${x}`));
    else questions.push(q);
  });
  return { questions, erreurs };
}

/** Export au format des fichiers de la banque : un objet par catégorie, prêt à remplacer src/data/questions/*.json. */
export function versFichiersBanque(questions: Question[]): Record<Categorie, { categorie: Categorie; questions: Omit<Question, 'source' | 'categorie'>[] }> {
  const fichiers = {} as Record<Categorie, { categorie: Categorie; questions: Omit<Question, 'source' | 'categorie'>[] }>;
  for (const c of CATEGORIES) fichiers[c] = { categorie: c, questions: [] };
  for (const q of questions) {
    const { source: _s, categorie, ...reste } = q;
    fichiers[categorie]?.questions.push(reste);
  }
  return fichiers;
}
