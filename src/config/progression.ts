import type { ContexteBadge } from '@/engine/progression';

/** Points d'expérience. */
export const XP = {
  /** Par bonne réponse, multiplié par le multiplicateur de difficulté de la question. */
  bonneReponse: 10,
  /** Par réponse fausse : on apprend aussi en se trompant. */
  participation: 1,
  partieParfaite: 50,
  /** Facteur selon le mode. */
  facteurMode: { entrainement: 0.5, revision: 0.5, duel: 0.5, defi: 1.5 } as Record<string, number>,
  /** XP cumulée pour atteindre le niveau n : seuil(n) = pas × (n - 1) × n / 2. */
  pas: 100,
};

/** Titres selon le niveau (le premier dont le niveau minimal est atteint, en partant du haut). */
export const TITRES: { min: number; titre: string }[] = [
  { min: 30, titre: 'Légende de QuizMania' },
  { min: 23, titre: 'Encyclopédie vivante' },
  { min: 17, titre: 'Puits de science' },
  { min: 12, titre: 'Tête bien faite' },
  { min: 8, titre: 'Érudit' },
  { min: 5, titre: 'Futé' },
  { min: 3, titre: 'Fouineur' },
  { min: 1, titre: 'Curieux' },
];

export type Badge = {
  id: string;
  nom: string;
  description: string;
  icone: string;
  condition: (c: ContexteBadge) => boolean;
};

const bonnesEn = (c: ContexteBadge, cat: keyof ContexteBadge['stats']['parCategorie']) => c.stats.parCategorie[cat]?.bonnes ?? 0;

/** Les badges à débloquer. Ajouter un badge = ajouter une entrée ici. */
export const BADGES: Badge[] = [
  { id: 'premiere-partie', nom: 'Premier pas', description: 'Terminer une première partie', icone: '👣', condition: (c) => c.stats.parties >= 1 },
  { id: 'habitue', nom: 'Habitué', description: 'Terminer 10 parties', icone: '🎟️', condition: (c) => c.stats.parties >= 10 },
  { id: 'accro', nom: 'Accro', description: 'Terminer 50 parties', icone: '🎰', condition: (c) => c.stats.parties >= 50 },
  { id: 'sans-faute', nom: 'Sans faute', description: 'Réussir une partie parfaite (au moins 10 questions)', icone: '💯', condition: (c) => c.stats.partiesParfaites >= 1 },
  { id: 'en-feu', nom: 'En feu', description: 'Enchaîner 5 bonnes réponses', icone: '🔥', condition: (c) => c.stats.meilleureSerie >= 5 },
  { id: 'inarretable', nom: 'Inarrêtable', description: 'Enchaîner 10 bonnes réponses', icone: '☄️', condition: (c) => c.stats.meilleureSerie >= 10 },
  { id: 'centurion', nom: 'Centurion', description: '100 bonnes réponses au total', icone: '🛡️', condition: (c) => c.stats.bonnes >= 100 },
  { id: 'millenaire', nom: 'Millénaire', description: '1 000 bonnes réponses au total', icone: '🏛️', condition: (c) => c.stats.bonnes >= 1000 },
  { id: 'oreille-d-or', nom: 'Oreille d’or', description: '100 bonnes réponses en chansons françaises', icone: '🎧', condition: (c) => bonnesEn(c, 'chansons_francaises') >= 100 },
  { id: 'globe-trotter', nom: 'Globe-trotter', description: '50 bonnes réponses en géographie', icone: '🧭', condition: (c) => bonnesEn(c, 'geographie') >= 50 },
  { id: 'historien', nom: 'Historien', description: '50 bonnes réponses en histoire', icone: '📜', condition: (c) => bonnesEn(c, 'histoire') >= 50 },
  { id: 'touche-a-tout', nom: 'Touche-à-tout', description: 'Répondre juste dans les 12 catégories', icone: '🎨', condition: (c) => Object.values(c.stats.parCategorie).filter((s) => s.bonnes > 0).length >= 12 },
  { id: 'puriste', nom: 'Puriste', description: 'Au moins 80 % de bonnes réponses en Expert, sans joker', icone: '🧐', condition: (c) => c.stats.expertSansJoker >= 1 },
  { id: 'fidele', nom: 'Fidèle', description: '10 jours de suite au défi du jour', icone: '📅', condition: (c) => c.serieDefi >= 10 },
  { id: 'regulier', nom: 'Régulier', description: '3 jours de suite au défi du jour', icone: '🗓️', condition: (c) => c.serieDefi >= 3 },
  { id: 'eclair', nom: 'Éclair', description: '15 bonnes réponses en contre-la-montre', icone: '⚡', condition: (c) => c.stats.meilleurChrono >= 15 },
  { id: 'survivant', nom: 'Survivant', description: 'Tenir 20 questions en survie', icone: '🧗', condition: (c) => c.stats.meilleureSurvie >= 20 },
  { id: 'duelliste', nom: 'Duelliste', description: 'Jouer un duel local', icone: '⚔️', condition: (c) => c.stats.duels >= 1 },
  { id: 'animateur', nom: 'Animateur', description: 'Organiser un duel à 4 joueurs', icone: '🎙️', condition: (c) => c.stats.duelsQuatre >= 1 },
  { id: 'reflexe', nom: 'Réflexe', description: '10 bonnes réponses en moins de 2 secondes', icone: '🐆', condition: (c) => c.stats.reponsesEclair >= 10 },
  { id: 'dans-le-mille', nom: 'Dans le mille', description: 'Une estimation parfaitement exacte', icone: '🎯', condition: (c) => c.stats.estimationsExactes >= 1 },
  { id: 'maitre-du-temps', nom: 'Maître du temps', description: 'Une chronologie parfaite', icone: '⏳', condition: (c) => c.stats.chronologiesParfaites >= 1 },
  { id: 'plume', nom: 'Belle plume', description: '10 bonnes réponses en saisie libre', icone: '✒️', condition: (c) => c.stats.saisiesJustes >= 10 },
  { id: 'perseverant', nom: 'Persévérant', description: 'Corriger 10 questions en révision', icone: '🔁', condition: (c) => c.stats.corrigesRevision >= 10 },
  { id: 'studieux', nom: 'Studieux', description: 'Terminer 5 entraînements', icone: '📖', condition: (c) => (c.stats.parMode.entrainement ?? 0) >= 5 },
  { id: 'oiseau-de-nuit', nom: 'Oiseau de nuit', description: 'Jouer entre minuit et 5 heures', icone: '🦉', condition: (c) => c.stats.partiesNocturnes >= 1 },
  { id: 'erudit', nom: 'Érudit', description: 'Atteindre le niveau 8', icone: '🎓', condition: (c) => c.niveau >= 8 },
];
