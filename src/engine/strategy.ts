import { type Card, type UpValue, UP_VALUES, cardPoints, upValue, upValueLabel } from './cards';
import { handValue, isPair } from './hand';
import { type TableRules } from './rules';

/** Actions de jeu : Tirer, Rester, Doubler, Séparer (sPlit), abandonner (suRrender). */
export type Action = 'H' | 'S' | 'D' | 'P' | 'R';

export const ACTION_LABELS: Record<Action, string> = {
  H: 'Tirer',
  S: 'Rester',
  D: 'Doubler',
  P: 'Séparer',
  R: 'Abandonner',
};

/**
 * Codes des tableaux :
 *  - D  : doubler si autorisé, sinon tirer
 *  - Ds : doubler si autorisé, sinon rester
 */
export type ChartCode = 'H' | 'S' | 'D' | 'Ds' | 'P' | 'R';

export type HandKind = 'hard' | 'soft' | 'pair';

/** Description d'une situation : type de main + total (ou valeur de la paire) + carte du croupier. */
export interface Situation {
  kind: HandKind;
  /** hard/soft : total de la main ; pair : valeur d'une carte (2…10, 11 = As). */
  value: number;
  dealer: UpValue;
}

export interface PlayOptions {
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

const between = (d: number, lo: number, hi: number) => d >= lo && d <= hi;

/** Tableau des mains dures (sans abandon). */
export function hardCode(total: number, d: UpValue, r: TableRules): ChartCode {
  if (total <= 8) return 'H';
  if (total === 9) return between(d, 3, 6) ? 'D' : 'H';
  if (total === 10) return d <= 9 ? 'D' : 'H';
  if (total === 11) return d <= 10 || r.dealerHitsSoft17 ? 'D' : 'H';
  if (total === 12) return between(d, 4, 6) ? 'S' : 'H';
  if (total <= 16) return d <= 6 ? 'S' : 'H';
  return 'S';
}

/** Tableau des mains soft (As compté 11). total entre 13 (A,2) et 21. */
export function softCode(total: number, d: UpValue, r: TableRules): ChartCode {
  if (total <= 12) return 'H'; // A,A sans possibilité de séparer
  if (total <= 14) return between(d, 5, 6) ? 'D' : 'H';
  if (total <= 16) return between(d, 4, 6) ? 'D' : 'H';
  if (total === 17) return between(d, 3, 6) ? 'D' : 'H';
  if (total === 18) {
    if (between(d, 3, 6) || (d === 2 && r.dealerHitsSoft17)) return 'Ds';
    if (d <= 8) return 'S';
    return 'H';
  }
  if (total === 19) return d === 6 && r.dealerHitsSoft17 ? 'Ds' : 'S';
  return 'S';
}

/** Faut-il séparer la paire ? (v = valeur d'une carte, 11 = As) */
export function shouldSplit(v: number, d: UpValue, r: TableRules): boolean {
  const das = r.doubleAfterSplit;
  switch (v) {
    case 11:
    case 8:
      return true;
    case 10:
    case 5:
      return false;
    case 9:
      return between(d, 2, 6) || d === 8 || d === 9;
    case 7:
      return d <= 7;
    case 6:
      return das ? d <= 6 : between(d, 3, 6);
    case 4:
      return das && between(d, 5, 6);
    case 3:
    case 2:
      return das ? d <= 7 : between(d, 4, 7);
    default:
      return false;
  }
}

/**
 * Abandon tardif (sabot 4-8 jeux).
 * S17 : 16 contre 9, 10, As ; 15 contre 10.
 * H17 : on ajoute 15 contre As, 17 contre As et 8,8 contre As.
 * `pairValue` est fourni si la main est une paire (une paire de 8 se sépare plutôt qu'abandonner en S17).
 */
export function shouldSurrender(hardTotal: number, d: UpValue, r: TableRules, pairValue?: number): boolean {
  if (pairValue !== undefined) {
    return pairValue === 8 && d === 11 && r.dealerHitsSoft17;
  }
  if (hardTotal === 16) return d >= 9;
  if (hardTotal === 15) return d === 10 || (d === 11 && r.dealerHitsSoft17);
  if (hardTotal === 17) return d === 11 && r.dealerHitsSoft17;
  return false;
}

export function resolveCode(code: ChartCode, opts: PlayOptions): Action {
  switch (code) {
    case 'D':
      return opts.canDouble ? 'D' : 'H';
    case 'Ds':
      return opts.canDouble ? 'D' : 'S';
    default:
      return code;
  }
}

/** Classe une main : paire, soft ou dure. */
export function classify(cards: readonly Card[], dealerUp: Card | UpValue): Situation {
  const dealer = typeof dealerUp === 'number' ? dealerUp : upValue(dealerUp);
  if (isPair(cards)) return { kind: 'pair', value: upValue(cards[0]), dealer };
  const v = handValue(cards);
  return { kind: v.soft ? 'soft' : 'hard', value: v.total, dealer };
}

/** Action de stratégie de base pour une main concrète. */
export function basicStrategy(
  cards: readonly Card[],
  dealerUp: Card | UpValue,
  rules: TableRules,
  opts: PlayOptions,
): Action {
  const d = typeof dealerUp === 'number' ? dealerUp : upValue(dealerUp);
  const v = handValue(cards);
  const pair = isPair(cards) ? upValue(cards[0]) : undefined;
  return basicStrategyFor({ total: v.total, soft: v.soft, pairValue: pair, dealer: d }, rules, opts);
}

export interface HandShape {
  total: number;
  soft: boolean;
  pairValue?: number;
  dealer: UpValue;
}

export function basicStrategyFor(h: HandShape, rules: TableRules, opts: PlayOptions): Action {
  const { total, soft, pairValue, dealer: d } = h;
  if (total >= 21 && !soft) return 'S';
  if (opts.canSurrender && rules.lateSurrender && !soft) {
    if (shouldSurrender(total, d, rules, pairValue)) return 'R';
  }
  if (pairValue !== undefined && opts.canSplit && shouldSplit(pairValue, d, rules)) return 'P';
  const code = soft ? softCode(total, d, rules) : hardCode(total, d, rules);
  return resolveCode(code, opts);
}

/** Action d'un tableau pour une « situation » abstraite (utile pour les flash cards). */
export function situationAction(s: Situation, rules: TableRules, opts: PlayOptions): Action {
  if (s.kind === 'pair') {
    const v = s.value;
    const total = v === 11 ? 12 : v * 2;
    return basicStrategyFor({ total, soft: v === 11, pairValue: v, dealer: s.dealer }, rules, opts);
  }
  return basicStrategyFor({ total: s.value, soft: s.kind === 'soft', dealer: s.dealer }, rules, opts);
}

export function situationKey(s: Situation): string {
  return `${s.kind}:${s.value}:${s.dealer}`;
}

export function parseSituationKey(key: string): Situation {
  const [kind, value, dealer] = key.split(':');
  return { kind: kind as HandKind, value: Number(value), dealer: Number(dealer) as UpValue };
}

export function situationLabel(s: Situation): string {
  const dealer = upValueLabel(s.dealer);
  if (s.kind === 'pair') {
    const c = s.value === 11 ? 'A' : String(s.value);
    return `Paire ${c},${c} contre ${dealer}`;
  }
  if (s.kind === 'soft') return `Soft ${s.value} (A,${s.value - 11}) contre ${dealer}`;
  return `Dur ${s.value} contre ${dealer}`;
}

/* ------------------------------------------------------------------ */
/* Tableaux complets pour l'affichage                                  */
/* ------------------------------------------------------------------ */

export interface ChartRow {
  label: string;
  cells: ChartCode[];
}

export interface StrategyCharts {
  dealers: readonly UpValue[];
  hard: ChartRow[];
  soft: ChartRow[];
  pairs: ChartRow[];
  surrender: ChartRow[];
}

export function buildCharts(rules: TableRules): StrategyCharts {
  const hard: ChartRow[] = [];
  hard.push({ label: '5–8', cells: UP_VALUES.map((d) => hardCode(8, d, rules)) });
  for (let t = 9; t <= 16; t++) hard.push({ label: String(t), cells: UP_VALUES.map((d) => hardCode(t, d, rules)) });
  hard.push({ label: '17+', cells: UP_VALUES.map((d) => hardCode(17, d, rules)) });

  const soft: ChartRow[] = [];
  for (let t = 13; t <= 20; t++) {
    soft.push({ label: `A,${t - 11}`, cells: UP_VALUES.map((d) => softCode(t, d, rules)) });
  }

  const pairs: ChartRow[] = [];
  for (const v of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
    const c = v === 11 ? 'A' : String(v);
    pairs.push({
      label: `${c},${c}`,
      cells: UP_VALUES.map((d) => {
        if (shouldSplit(v, d, rules)) return 'P';
        const total = v === 11 ? 12 : v * 2;
        return v === 11 ? softCode(12, d, rules) : hardCode(total, d, rules);
      }),
    });
  }

  const surrender: ChartRow[] = [];
  const surrenderRows: { label: string; total: number; pair?: number }[] = [
    { label: '15', total: 15 },
    { label: '16', total: 16 },
    { label: '17', total: 17 },
    { label: '8,8', total: 16, pair: 8 },
  ];
  for (const row of surrenderRows) {
    surrender.push({
      label: row.label,
      cells: UP_VALUES.map((d) => {
        if (rules.lateSurrender && shouldSurrender(row.total, d, rules, row.pair)) return 'R';
        if (row.pair !== undefined) return 'P';
        return hardCode(row.total, d, rules);
      }),
    });
  }
  return { dealers: UP_VALUES, hard, soft, pairs, surrender };
}

/** Probabilité (≈, %) que le croupier saute selon sa carte visible — sabot, S17. */
export const DEALER_BUST_PCT: Record<UpValue, number> = {
  2: 35, 3: 38, 4: 40, 5: 43, 6: 42, 7: 26, 8: 24, 9: 23, 10: 21, 11: 17,
};

/**
 * Explication pédagogique de l'action correcte pour une situation.
 */
export function explainSituation(s: Situation, action: Action, rules: TableRules): string {
  const d = s.dealer;
  const dl = upValueLabel(d);
  const bust = DEALER_BUST_PCT[d];
  const weak = d <= 6;
  if (action === 'R') {
    return `Abandon : avec ${situationLabel(s).toLowerCase()}, vous perdez en moyenne plus de 50 % de votre mise en jouant. Récupérer la moitié de la mise coûte moins cher (perte fixe de 50 %).`;
  }
  if (s.kind === 'pair') {
    const v = s.value;
    if (action === 'P') {
      if (v === 11) return 'On sépare TOUJOURS les As : deux mains qui démarrent à 11 valent bien mieux qu\'un soft 12.';
      if (v === 8) return 'On sépare TOUJOURS les 8 : 16 est la pire main du jeu ; deux mains qui partent de 8 perdent beaucoup moins.';
      if (weak) return `Le ${dl} du croupier est une carte faible (il saute ≈ ${bust} % du temps) : séparer permet de mettre plus d'argent sur la table quand on est favori${rules.doubleAfterSplit ? ', avec en plus la possibilité de doubler après séparation (DAS)' : ''}.`;
      return `Contre ${dl}, chaque main issue de la séparation (partant de ${v}) fait mieux que le total ${v * 2} conservé.`;
    }
    if (v === 10) return 'On ne sépare jamais les 10 : 20 gagne environ 85 % des mains non nulles. Casser un 20 est une erreur coûteuse.';
    if (v === 5) return 'Une paire de 5 se joue comme un 10 dur : on double contre 2 à 9. Séparer donnerait deux mains médiocres partant de 5.';
    if (v === 9 && action === 'S') return d === 7 ? '9,9 contre 7 : vous avez 18, et le croupier avec un 7 fait souvent 17. 18 bat 17 : on reste.' : `9,9 contre ${dl} : 18 est déjà une main correcte, séparer contre une carte forte du croupier coûte plus que cela ne rapporte.`;
  }
  if (action === 'D') {
    if (s.kind === 'soft') return `Main soft contre une carte faible (${dl}) : impossible de sauter en tirant une carte, et le croupier saute ≈ ${bust} % du temps. On double pour mettre plus d'argent en situation favorable.`;
    return `Avec ${s.value}, une carte de valeur 10 (≈ 31 % des cartes) vous donne une main très forte. Contre ${dl}, vous êtes favori : on double la mise.`;
  }
  if (action === 'S') {
    if (s.kind === 'soft') return `Soft ${s.value} est une main solide contre ${dl} : on reste.`;
    if (s.value >= 17) return 'Avec 17 ou plus en main dure, le risque de sauter en tirant est trop élevé : on reste toujours.';
    return `Le croupier montre ${dl}, une carte faible : il doit tirer et saute ≈ ${bust} % du temps. Avec ${s.value}, vous risquez de sauter en tirant ; on le laisse prendre ce risque.`;
  }
  // action === 'H'
  if (s.kind === 'soft') return `Soft ${s.value} contre ${dl} : on améliore la main sans risque de sauter (l'As peut repasser à 1).`;
  if (s.value <= 11) return `Avec ${s.value}, aucune carte ne peut vous faire sauter : on tire toujours.`;
  if (d >= 7) return `Le croupier montre ${dl}, une carte forte : il finira souvent à 17 ou plus (il ne saute que ≈ ${bust} % du temps). Avec ${s.value}, rester revient à espérer qu'il saute : on tire.`;
  return `12 contre ${dl} : le croupier ne saute pas assez souvent (≈ ${bust} %) et seules les cartes de 10 vous font sauter. On tire.`;
}

/** Utilisé par les tests et les exercices : valeur de la paire d'une main (ou undefined). */
export function pairValueOf(cards: readonly Card[]): number | undefined {
  return isPair(cards) ? (cards[0].rank === 'A' ? 11 : cardPoints(cards[0])) : undefined;
}
