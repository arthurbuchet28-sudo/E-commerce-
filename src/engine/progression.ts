import { BADGES, TITRES, XP, type Badge } from '@/config/progression';
import { DIFFICULTES } from '@/config/difficulte';
import type { ModeJeu } from '@/config/modes';
import type { Categorie, CategorieJeu, Question } from '@/types/question';
import { grilleEmojis, resumerPartie, type EtatPartie } from './partie';

// --- Niveaux -------------------------------------------------------------

/** XP cumulée nécessaire pour atteindre le niveau n. */
export function seuilNiveau(n: number): number {
  return (XP.pas * (n - 1) * n) / 2;
}

export type InfoNiveau = { niveau: number; titre: string; xpDebut: number; xpFin: number; progression: number };

export function niveauDepuisXp(xp: number): InfoNiveau {
  let niveau = 1;
  while (seuilNiveau(niveau + 1) <= xp) niveau++;
  const xpDebut = seuilNiveau(niveau);
  const xpFin = seuilNiveau(niveau + 1);
  return {
    niveau,
    titre: titrePourNiveau(niveau),
    xpDebut,
    xpFin,
    progression: (xp - xpDebut) / (xpFin - xpDebut),
  };
}

export function titrePourNiveau(niveau: number): string {
  return TITRES.find((t) => niveau >= t.min)?.titre ?? TITRES.at(-1)!.titre;
}

/** XP gagnée sur une partie. */
export function xpPourPartie(partie: EtatPartie): number {
  let xp = 0;
  partie.resultats.forEach((r, i) => {
    if (r.passee) return;
    const mult = DIFFICULTES[partie.questions[i]?.niveau ?? 'moyen'].multiplicateur;
    if (r.correct) xp += XP.bonneReponse * mult;
    else if (r.fraction > 0) xp += XP.bonneReponse * mult * r.fraction * 0.5;
    else xp += XP.participation;
  });
  if (estParfaite(partie)) xp += XP.partieParfaite;
  return Math.round(xp * (XP.facteurMode[partie.config.mode] ?? 1));
}

function estParfaite(partie: EtatPartie): boolean {
  const repondues = partie.resultats.filter((r) => !r.passee);
  return repondues.length >= 10 && repondues.every((r) => r.correct) && ['classique', 'defi', 'blind_test'].includes(partie.config.mode);
}

// --- Statistiques --------------------------------------------------------

export type StatsCategorie = { questions: number; bonnes: number };

export type Statistiques = {
  parties: number;
  questions: number;
  bonnes: number;
  parCategorie: Partial<Record<Categorie, StatsCategorie>>;
  parMode: Partial<Record<ModeJeu, number>>;
  meilleureSerie: number;
  partiesParfaites: number;
  saisiesJustes: number;
  /** Bonnes réponses en moins de 2 secondes. */
  reponsesEclair: number;
  estimationsExactes: number;
  chronologiesParfaites: number;
  corrigesRevision: number;
  /** Record de bonnes réponses en contre-la-montre. */
  meilleurChrono: number;
  /** Record de questions tenues en survie. */
  meilleureSurvie: number;
  duels: number;
  duelsQuatre: number;
  expertSansJoker: number;
  partiesNocturnes: number;
};

export const STATS_VIDES: Statistiques = {
  parties: 0,
  questions: 0,
  bonnes: 0,
  parCategorie: {},
  parMode: {},
  meilleureSerie: 0,
  partiesParfaites: 0,
  saisiesJustes: 0,
  reponsesEclair: 0,
  estimationsExactes: 0,
  chronologiesParfaites: 0,
  corrigesRevision: 0,
  meilleurChrono: 0,
  meilleureSurvie: 0,
  duels: 0,
  duelsQuatre: 0,
  expertSansJoker: 0,
  partiesNocturnes: 0,
};

/** Met à jour les statistiques cumulées avec une partie terminée. */
export function majStatistiques(stats: Statistiques, partie: EtatPartie, date: Date): Statistiques {
  const s: Statistiques = { ...STATS_VIDES, ...stats, parCategorie: { ...stats.parCategorie }, parMode: { ...stats.parMode } };
  const resume = resumerPartie(partie);
  const mode = partie.config.mode;
  s.parties++;
  s.parMode[mode] = (s.parMode[mode] ?? 0) + 1;
  partie.resultats.forEach((r, i) => {
    if (r.passee) return;
    const q = partie.questions[i];
    s.questions++;
    if (r.correct) s.bonnes++;
    const cat = { ...(s.parCategorie[r.categorie] ?? { questions: 0, bonnes: 0 }) };
    cat.questions++;
    if (r.correct) cat.bonnes++;
    s.parCategorie[r.categorie] = cat;
    if (r.correct && q?.mode === 'saisie') s.saisiesJustes++;
    if (r.correct && r.tempsMis < 2) s.reponsesEclair++;
    if (q?.mode === 'estimation' && r.ecart === 0) s.estimationsExactes++;
    if (q?.mode === 'chronologie' && r.correct) s.chronologiesParfaites++;
    if (mode === 'revision' && r.correct) s.corrigesRevision++;
  });
  s.meilleureSerie = Math.max(s.meilleureSerie, resume.meilleureSerie);
  if (estParfaite(partie)) s.partiesParfaites++;
  if (mode === 'contre_la_montre') s.meilleurChrono = Math.max(s.meilleurChrono, resume.bonnes);
  if (mode === 'survie') s.meilleureSurvie = Math.max(s.meilleureSurvie, partie.resultats.length);
  if (mode === 'duel') {
    s.duels++;
    if ((partie.joueurs?.length ?? 0) >= 4) s.duelsQuatre++;
  }
  if (partie.config.difficulte === 'expert' && resume.repondues >= 10 && resume.precision >= 0.8 && partie.jokersUtilises.length === 0) s.expertSansJoker++;
  if (date.getHours() < 5) s.partiesNocturnes++;
  return s;
}

/** Catégorie la plus forte et catégorie à travailler (au moins `minimum` questions jouées). */
export function forcesEtFaiblesses(stats: Statistiques, minimum = 5): { forte?: Categorie; aTravailler?: Categorie } {
  const jouees = (Object.entries(stats.parCategorie) as [Categorie, StatsCategorie][])
    .filter(([, s]) => s.questions >= minimum)
    .map(([c, s]) => ({ c, taux: s.bonnes / s.questions }))
    .sort((a, b) => b.taux - a.taux);
  if (!jouees.length) return {};
  const forte = jouees[0]!.c;
  const aTravailler = jouees.length > 1 ? jouees.at(-1)!.c : undefined;
  return { forte, aTravailler: aTravailler !== forte ? aTravailler : undefined };
}

// --- Badges --------------------------------------------------------------

export type ContexteBadge = { stats: Statistiques; niveau: number; serieDefi: number };

/** Badges nouvellement débloqués (ceux déjà obtenus sont ignorés). */
export function nouveauxBadges(contexte: ContexteBadge, dejaObtenus: Iterable<string>, badges: Badge[] = BADGES): Badge[] {
  const obtenus = new Set(dejaObtenus);
  return badges.filter((b) => !obtenus.has(b.id) && b.condition(contexte));
}

// --- Historique et classement -------------------------------------------

export type EntreeHistorique = {
  id: string;
  /** Date ISO. */
  date: string;
  mode: ModeJeu;
  categorie: CategorieJeu;
  difficulte: string;
  filtre?: string;
  score: number;
  bonnes: number;
  total: number;
  precision: number;
  meilleureSerie: number;
  grille: string;
  /** Joueur (pseudo du profil) ; en duel, chaque participant. */
  joueurs: { nom: string; score: number }[];
};

export function entreeHistorique(partie: EtatPartie, pseudo: string, date: Date): EntreeHistorique {
  const r = resumerPartie(partie);
  const c = partie.config;
  return {
    id: `${date.getTime()}-${Math.round(Math.random() * 1e6)}`,
    date: date.toISOString(),
    mode: c.mode,
    categorie: c.categorie,
    difficulte: c.difficulte,
    filtre: c.filtre,
    score: r.score,
    bonnes: r.bonnes,
    total: r.total,
    precision: r.precision,
    meilleureSerie: r.meilleureSerie,
    grille: grilleEmojis(partie.resultats),
    joueurs: partie.joueurs ? partie.joueurs.map((j) => ({ nom: j.nom, score: j.score })) : [{ nom: pseudo, score: r.score }],
  };
}

export type LigneClassement = { rang: number; nom: string; score: number; date: string; categorie: CategorieJeu; entreeId: string };

/** Classement local : meilleurs scores pour un mode (et une difficulté), joueurs de duel compris. */
export function classement(historique: EntreeHistorique[], mode: ModeJeu, difficulte?: string, taille = 10): LigneClassement[] {
  const lignes = historique
    .filter((e) => e.mode === mode && (!difficulte || e.difficulte === difficulte))
    .flatMap((e) => e.joueurs.map((j) => ({ nom: j.nom, score: j.score, date: e.date, categorie: e.categorie, entreeId: e.id })))
    .filter((l) => l.score > 0)
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, taille);
  return lignes.map((l, i) => ({ ...l, rang: i + 1 }));
}

// --- Révision ------------------------------------------------------------

/** Questions ratées (hors questions passées) à reposer en révision. */
export function questionsRatees(partie: EtatPartie): Question[] {
  return partie.resultats.flatMap((r, i) => (!r.correct && !r.passee && partie.questions[i] ? [partie.questions[i]!.question] : []));
}

/** Questions corrigées pendant une révision (à retirer de la liste). */
export function questionsCorrigees(partie: EtatPartie): string[] {
  return partie.resultats.filter((r) => r.correct).map((r) => r.questionId);
}
