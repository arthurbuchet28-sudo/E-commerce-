import { type Card, type UpValue, upValue, upValueLabel } from './cards';
import { handValue, isPair } from './hand';
import { type TableRules } from './rules';
import { type Action, type HandShape, type PlayOptions, basicStrategyFor } from './strategy';

/**
 * Déviations de stratégie Hi-Lo : Illustrious 18 (Schlesinger) et Fab 4 (abandons).
 * Indices valables pour un SABOT (4 à 8 jeux), croupier S17, DAS, abandon tardif,
 * avec un true count arrondi à l'entier inférieur. Pour H17 ou un jeu simple/double,
 * certains indices changent d'une unité environ.
 *
 * Convention : la déviation s'applique quand TC ≥ indice (direction « above »)
 * ou quand TC < indice (direction « below », pour les mains où l'on passe de
 * « rester » à « tirer » lorsque le compte devient négatif).
 */
export interface Deviation {
  id: string;
  group: 'I18' | 'Fab4';
  /** Rang d'importance dans la liste (1 = la plus rentable). */
  rank: number;
  label: string;
  /** Main concernée. pairValue renseigné pour 10,10. */
  hand: { total: number; pairValue?: number };
  /** 0 = assurance (pas de carte précise), sinon carte du croupier. */
  dealer: UpValue;
  index: number;
  direction: 'above' | 'below';
  /** Action de stratégie de base (hors déviation). */
  basic: Action | 'NoIns';
  /** Action quand la déviation s'applique. */
  deviation: Action | 'Ins';
  note?: string;
}

export const INSURANCE_INDEX = 3;

export const DEVIATIONS: Deviation[] = [
  { id: 'ins', group: 'I18', rank: 1, label: 'Assurance (croupier montre un As)', hand: { total: 0 }, dealer: 11, index: 3, direction: 'above', basic: 'NoIns', deviation: 'Ins', note: "L'assurance devient rentable quand plus d'1/3 des cartes restantes sont des 10." },
  { id: '16v10', group: 'I18', rank: 2, label: '16 contre 10', hand: { total: 16 }, dealer: 10, index: 0, direction: 'above', basic: 'H', deviation: 'S', note: "Si l'abandon est autorisé, on abandonne (prioritaire). Sinon : rester dès que TC ≥ 0." },
  { id: '15v10', group: 'I18', rank: 3, label: '15 contre 10', hand: { total: 15 }, dealer: 10, index: 4, direction: 'above', basic: 'H', deviation: 'S', note: "Sans abandon. Avec abandon, voir le Fab 4 (abandon dès TC ≥ 0)." },
  { id: 'TTv5', group: 'I18', rank: 4, label: '10,10 contre 5', hand: { total: 20, pairValue: 10 }, dealer: 5, index: 5, direction: 'above', basic: 'S', deviation: 'P', note: 'Déviation très voyante : elle attire l\'attention du personnel.' },
  { id: 'TTv6', group: 'I18', rank: 5, label: '10,10 contre 6', hand: { total: 20, pairValue: 10 }, dealer: 6, index: 4, direction: 'above', basic: 'S', deviation: 'P', note: 'Déviation très voyante : elle attire l\'attention du personnel.' },
  { id: '10v10', group: 'I18', rank: 6, label: '10 contre 10', hand: { total: 10 }, dealer: 10, index: 4, direction: 'above', basic: 'H', deviation: 'D' },
  { id: '12v3', group: 'I18', rank: 7, label: '12 contre 3', hand: { total: 12 }, dealer: 3, index: 2, direction: 'above', basic: 'H', deviation: 'S' },
  { id: '12v2', group: 'I18', rank: 8, label: '12 contre 2', hand: { total: 12 }, dealer: 2, index: 3, direction: 'above', basic: 'H', deviation: 'S' },
  { id: '11vA', group: 'I18', rank: 9, label: '11 contre As', hand: { total: 11 }, dealer: 11, index: 1, direction: 'above', basic: 'H', deviation: 'D', note: 'En H17, la stratégie de base double déjà 11 contre As.' },
  { id: '9v2', group: 'I18', rank: 10, label: '9 contre 2', hand: { total: 9 }, dealer: 2, index: 1, direction: 'above', basic: 'H', deviation: 'D' },
  { id: '10vA', group: 'I18', rank: 11, label: '10 contre As', hand: { total: 10 }, dealer: 11, index: 4, direction: 'above', basic: 'H', deviation: 'D' },
  { id: '9v7', group: 'I18', rank: 12, label: '9 contre 7', hand: { total: 9 }, dealer: 7, index: 3, direction: 'above', basic: 'H', deviation: 'D' },
  { id: '16v9', group: 'I18', rank: 13, label: '16 contre 9', hand: { total: 16 }, dealer: 9, index: 5, direction: 'above', basic: 'H', deviation: 'S', note: "Sans abandon (avec abandon, 16 contre 9 s'abandonne)." },
  { id: '13v2', group: 'I18', rank: 14, label: '13 contre 2', hand: { total: 13 }, dealer: 2, index: -1, direction: 'below', basic: 'S', deviation: 'H' },
  { id: '12v4', group: 'I18', rank: 15, label: '12 contre 4', hand: { total: 12 }, dealer: 4, index: 0, direction: 'below', basic: 'S', deviation: 'H' },
  { id: '12v5', group: 'I18', rank: 16, label: '12 contre 5', hand: { total: 12 }, dealer: 5, index: -2, direction: 'below', basic: 'S', deviation: 'H' },
  { id: '12v6', group: 'I18', rank: 17, label: '12 contre 6', hand: { total: 12 }, dealer: 6, index: -1, direction: 'below', basic: 'S', deviation: 'H' },
  { id: '13v3', group: 'I18', rank: 18, label: '13 contre 3', hand: { total: 13 }, dealer: 3, index: -2, direction: 'below', basic: 'S', deviation: 'H' },
  // Fab 4 — abandons (late surrender)
  { id: 'R14v10', group: 'Fab4', rank: 1, label: '14 contre 10 (abandon)', hand: { total: 14 }, dealer: 10, index: 3, direction: 'above', basic: 'H', deviation: 'R' },
  { id: 'R15v10', group: 'Fab4', rank: 2, label: '15 contre 10 (abandon)', hand: { total: 15 }, dealer: 10, index: 0, direction: 'below', basic: 'R', deviation: 'H', note: "La stratégie de base abandonne ; on cesse d'abandonner (on tire) si TC < 0." },
  { id: 'R15v9', group: 'Fab4', rank: 3, label: '15 contre 9 (abandon)', hand: { total: 15 }, dealer: 9, index: 2, direction: 'above', basic: 'H', deviation: 'R' },
  { id: 'R15vA', group: 'Fab4', rank: 4, label: '15 contre As (abandon)', hand: { total: 15 }, dealer: 11, index: 1, direction: 'above', basic: 'H', deviation: 'R', note: 'Indice S17. En H17, la stratégie de base abandonne déjà 15 contre As.' },
];

export function deviationApplies(dev: Deviation, tc: number): boolean {
  return dev.direction === 'above' ? tc >= dev.index : tc < dev.index;
}

export function formatIndex(dev: Deviation): string {
  const sign = dev.index > 0 ? '+' : '';
  return dev.direction === 'above' ? `TC ≥ ${sign}${dev.index}` : `TC < ${sign}${dev.index}`;
}

/** Faut-il prendre l'assurance ? (Hi-Lo, sabot) */
export function shouldTakeInsurance(tc: number): boolean {
  return tc >= INSURANCE_INDEX;
}

export interface CountedDecision {
  action: Action;
  basic: Action;
  deviation?: Deviation;
}

function findDeviation(h: HandShape, opts: PlayOptions, rules: TableRules): Deviation[] {
  return DEVIATIONS.filter((dev) => {
    if (dev.id === 'ins') return false;
    if (dev.dealer !== h.dealer) return false;
    if (h.soft) return false;
    if (dev.hand.pairValue !== undefined) return h.pairValue === dev.hand.pairValue && opts.canSplit;
    if (h.pairValue !== undefined && h.pairValue !== 10 && opts.canSplit) {
      // Une paire qui se sépare n'est pas concernée par les déviations de total (ex. 8,8 contre 10).
      const basic = basicStrategyFor(h, rules, opts);
      if (basic === 'P') return false;
    }
    if (dev.hand.total !== h.total) return false;
    if (dev.deviation === 'R' || dev.basic === 'R') return opts.canSurrender && rules.lateSurrender;
    if (dev.deviation === 'D') return opts.canDouble;
    return true;
  });
}

/**
 * Décision complète d'un compteur : stratégie de base + Illustrious 18 + Fab 4.
 * Ordre de priorité : abandon (si autorisé) → autres déviations → stratégie de base.
 */
export function countedDecision(
  h: HandShape,
  tc: number,
  rules: TableRules,
  opts: PlayOptions,
): CountedDecision {
  const basic = basicStrategyFor(h, rules, opts);
  const candidates = findDeviation(h, opts, rules);

  // 1. Abandon (Fab 4) : prioritaire quand il est autorisé.
  const surrenderDevs = candidates.filter((d) => d.deviation === 'R' || d.basic === 'R');
  for (const dev of surrenderDevs) {
    // Les indices Fab 4 sont donnés pour S17 ; en H17 la stratégie de base peut déjà abandonner.
    if (basic === 'R' && dev.basic !== 'R') return { action: 'R', basic };
    if (deviationApplies(dev, tc)) {
      const action = dev.deviation as Action;
      if (action === 'H') {
        // On n'abandonne plus : on applique alors la stratégie hors abandon, et l'éventuelle déviation de jeu.
        return withPlayDeviation(h, tc, rules, { ...opts, canSurrender: false }, basic);
      }
      return { action, basic, deviation: dev };
    }
    if (dev.basic === 'R') return { action: 'R', basic };
  }
  if (basic === 'R') return { action: 'R', basic };

  return withPlayDeviation(h, tc, rules, opts, basic);
}

function withPlayDeviation(h: HandShape, tc: number, rules: TableRules, opts: PlayOptions, basic: Action): CountedDecision {
  const candidates = findDeviation(h, opts, rules).filter((d) => d.deviation !== 'R' && d.basic !== 'R');
  const noSurrenderBasic = basicStrategyFor(h, rules, { ...opts, canSurrender: false });
  for (const dev of candidates) {
    if (dev.basic !== noSurrenderBasic) continue; // ex. 11 contre As en H17 : la base double déjà
    if (deviationApplies(dev, tc)) {
      return { action: dev.deviation as Action, basic, deviation: dev };
    }
  }
  return { action: noSurrenderBasic, basic, deviation: undefined };
}

/** Version pratique à partir de cartes réelles. */
export function countedDecisionForCards(
  cards: readonly Card[],
  dealerUp: Card | UpValue,
  tc: number,
  rules: TableRules,
  opts: PlayOptions,
): CountedDecision {
  const d = typeof dealerUp === 'number' ? dealerUp : upValue(dealerUp);
  const v = handValue(cards);
  const pair = isPair(cards) ? upValue(cards[0]) : undefined;
  return countedDecision({ total: v.total, soft: v.soft, pairValue: pair, dealer: d }, tc, rules, opts);
}

export function deviationTitle(dev: Deviation): string {
  return dev.id === 'ins' ? 'Assurance' : `${dev.label.replace(' (abandon)', '')} — ${upValueLabel(dev.dealer)}`;
}
