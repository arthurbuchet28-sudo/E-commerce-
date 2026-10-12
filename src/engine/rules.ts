/**
 * Règles d'une table de Blackjack et estimation de l'avantage de la maison.
 */
export type BlackjackPayout = 1.5 | 1.2;

export interface TableRules {
  /** Nombre de jeux de 52 cartes dans le sabot. */
  decks: number;
  /** Vrai si le croupier tire sur soft 17 (H17), faux s'il reste (S17). */
  dealerHitsSoft17: boolean;
  /** Double autorisé après séparation (DAS). */
  doubleAfterSplit: boolean;
  /** Abandon tardif (late surrender) autorisé. */
  lateSurrender: boolean;
  /** 1.5 = 3:2, 1.2 = 6:5. */
  blackjackPayout: BlackjackPayout;
  /** Pénétration : fraction du sabot distribuée avant le mélange (ex. 0.75). */
  penetration: number;
  /** Nombre maximal de mains après séparations. */
  maxHands: number;
  /** Re-séparation des As autorisée. */
  resplitAces: boolean;
}

/** Configuration de référence de toute la formation. */
export const REFERENCE_RULES: TableRules = {
  decks: 6,
  dealerHitsSoft17: false,
  doubleAfterSplit: true,
  lateSurrender: true,
  blackjackPayout: 1.5,
  penetration: 0.75,
  maxHands: 4,
  resplitAces: false,
};

export function rulesLabel(r: TableRules): string {
  return [
    `${r.decks} jeu${r.decks > 1 ? 'x' : ''}`,
    r.dealerHitsSoft17 ? 'H17' : 'S17',
    r.doubleAfterSplit ? 'DAS' : 'pas de DAS',
    r.lateSurrender ? 'abandon tardif' : "pas d'abandon",
    r.blackjackPayout === 1.5 ? 'BJ 3:2' : 'BJ 6:5',
    `pénétration ${Math.round(r.penetration * 100)} %`,
  ].join(' · ');
}

/**
 * Effet (en points de %) de chaque règle sur l'avantage de la maison,
 * pour un joueur jouant la stratégie de base parfaite.
 * Valeurs arrondies, du même ordre que celles publiées par les analystes
 * (Griffin, Wizard of Odds). Une valeur positive favorise le casino.
 */
export const RULE_EFFECTS = {
  /** Avantage de la maison pour 6 jeux, S17, DAS, sans abandon, BJ 3:2, re-split à 4 mains. */
  base6DeckS17DAS: 0.42,
  decks: { 1: -0.48, 2: -0.19, 4: -0.06, 5: -0.02, 6: 0, 8: 0.02 } as Record<number, number>,
  h17: 0.22,
  noDoubleAfterSplit: 0.14,
  lateSurrender: -0.08,
  payout65: 1.39,
  resplitAces: -0.08,
} as const;

function deckEffect(decks: number): number {
  const table = RULE_EFFECTS.decks;
  if (table[decks] !== undefined) return table[decks];
  // Interpolation grossière pour les valeurs non tabulées (3, 7…).
  if (decks === 3) return -0.1;
  if (decks === 7) return 0.01;
  return decks > 8 ? 0.03 : 0;
}

/**
 * Avantage de la maison estimé (en %, positif = en faveur du casino).
 * Remarque : la pénétration n'a AUCUN effet sur l'avantage de la maison face à un joueur
 * de stratégie de base ; elle n'influence que le rendement du compteur.
 */
export function houseEdge(r: TableRules): number {
  let edge = RULE_EFFECTS.base6DeckS17DAS + deckEffect(r.decks);
  if (r.dealerHitsSoft17) edge += RULE_EFFECTS.h17;
  if (!r.doubleAfterSplit) edge += RULE_EFFECTS.noDoubleAfterSplit;
  if (r.lateSurrender) edge += RULE_EFFECTS.lateSurrender;
  if (r.blackjackPayout === 1.2) edge += RULE_EFFECTS.payout65;
  if (r.resplitAces) edge += RULE_EFFECTS.resplitAces;
  return Math.round(edge * 100) / 100;
}
