import { createDeck } from './cards';
import { hiLoValue, playerEdgeAtTrueCount, trueCount } from './count';
import { type Rng, defaultRng, shuffleInPlace } from './rng';
import { type TableRules, houseEdge } from './rules';

/** Variance d'une main de blackjack, en unités² (écart-type ≈ 1,15 unité). */
export const HAND_VARIANCE = 1.32;

export const TC_MIN = -3;
export const TC_MAX = 6;

/** Une rampe de mise : nombre d'unités misées pour chaque true count (bornée de TC_MIN à TC_MAX). */
export type BetRamp = Record<number, number>;

export function clampTc(tc: number): number {
  return Math.max(TC_MIN, Math.min(TC_MAX, tc));
}

export function betForTc(ramp: BetRamp, tc: number): number {
  return ramp[clampTc(tc)] ?? 0;
}

/** Rampe classique 1-8 en sabot de 6 jeux. */
export function defaultRamp(spread = 8): BetRamp {
  const r: BetRamp = {};
  for (let tc = TC_MIN; tc <= TC_MAX; tc++) {
    let units = 1;
    if (tc >= 2) units = Math.min(spread, (tc - 1) * 2);
    r[tc] = Math.max(1, units);
  }
  return r;
}

export function rampSpread(ramp: BetRamp): number {
  const vals = Object.values(ramp).filter((v) => v > 0);
  if (vals.length === 0) return 0;
  return Math.max(...vals) / Math.min(...vals);
}

/**
 * Fréquence de chaque true count (arrondi plancher, borné) au début de chaque main,
 * estimée par simulation de sabots. Approximation : on retire en moyenne
 * 2,7 cartes par joueur et 2,9 pour le croupier à chaque main.
 */
export function simulateTrueCountFrequencies(
  rules: Pick<TableRules, 'decks' | 'penetration'>,
  players = 1,
  shoes = 400,
  rng: Rng = defaultRng,
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let tc = TC_MIN; tc <= TC_MAX; tc++) counts[tc] = 0;
  const cardsPerRound = 2.7 * players + 2.9;
  let total = 0;
  for (let s = 0; s < shoes; s++) {
    const cards = [];
    for (let d = 0; d < rules.decks; d++) cards.push(...createDeck());
    shuffleInPlace(cards, rng);
    const cut = Math.floor(cards.length * rules.penetration);
    let pos = 0;
    let rc = 0;
    while (pos < cut) {
      const tc = clampTc(trueCount(rc, (cards.length - pos) / 52, 'floor'));
      counts[tc]++;
      total++;
      const n = Math.max(2 * players + 2, Math.round(cardsPerRound + (rng() - 0.5) * 3));
      for (let i = 0; i < n && pos < cards.length; i++) rc += hiLoValue(cards[pos++]);
    }
  }
  const freqs: Record<number, number> = {};
  for (let tc = TC_MIN; tc <= TC_MAX; tc++) freqs[tc] = counts[tc] / total;
  return freqs;
}

export interface RampEvaluation {
  /** Gain espéré par main jouée (unités). */
  evPerRound: number;
  /** Écart-type par main (unités). */
  sdPerRound: number;
  /** Mise moyenne (unités). */
  averageBet: number;
  /** Avantage global (% de la mise moyenne). */
  edgePct: number;
  /** Fraction des mains jouées (en Wonging, on ne joue pas les TC trop bas). */
  playedFraction: number;
  /** N0 : nombre de mains pour que le gain espéré égale un écart-type. */
  n0: number;
}

/**
 * Évalue une rampe : E = Σ f(tc)·mise(tc)·avantage(tc), Var = Σ f(tc)·mise(tc)²·1,32.
 * Avantage(tc) ≈ −avantage maison + 0,5 % × tc. Une mise de 0 signifie qu'on ne joue pas (Wonging).
 */
export function evaluateRamp(ramp: BetRamp, freqs: Record<number, number>, houseEdgePct: number): RampEvaluation {
  let ev = 0;
  let variance = 0;
  let betSum = 0;
  let played = 0;
  for (let tc = TC_MIN; tc <= TC_MAX; tc++) {
    const f = freqs[tc] ?? 0;
    const bet = betForTc(ramp, tc);
    if (bet <= 0) continue;
    const edge = playerEdgeAtTrueCount(tc, houseEdgePct) / 100;
    ev += f * bet * edge;
    variance += f * bet * bet * HAND_VARIANCE;
    betSum += f * bet;
    played += f;
  }
  // Statistiques ramenées aux mains effectivement jouées.
  const evPerRound = played > 0 ? ev / played : 0;
  const varPerRound = played > 0 ? variance / played : 0;
  const averageBet = played > 0 ? betSum / played : 0;
  return {
    evPerRound,
    sdPerRound: Math.sqrt(varPerRound),
    averageBet,
    edgePct: averageBet > 0 ? (evPerRound / averageBet) * 100 : 0,
    playedFraction: played,
    n0: evPerRound > 0 ? varPerRound / (evPerRound * evPerRound) : Infinity,
  };
}

/**
 * Risque de ruine (horizon infini, approximation par diffusion) :
 * RoR = exp(−2·E·B / Var), avec E et Var par main et B la bankroll, dans la même unité.
 * Vaut 1 (ruine certaine) si l'espérance est négative ou nulle.
 */
export function riskOfRuin(evPerRound: number, sdPerRound: number, bankroll: number): number {
  if (evPerRound <= 0) return 1;
  if (bankroll <= 0) return 1;
  return Math.exp((-2 * evPerRound * bankroll) / (sdPerRound * sdPerRound));
}

/** Bankroll nécessaire pour un risque de ruine cible (ex. 0,05 pour 5 %). */
export function bankrollForRisk(evPerRound: number, sdPerRound: number, targetRisk: number): number {
  if (evPerRound <= 0) return Infinity;
  return (-Math.log(targetRisk) * sdPerRound * sdPerRound) / (2 * evPerRound);
}

/** Intervalle « ±k écarts-types » du résultat après n mains. */
export function resultRange(evPerRound: number, sdPerRound: number, rounds: number, k = 1): [number, number] {
  const mean = evPerRound * rounds;
  const sd = sdPerRound * Math.sqrt(rounds);
  return [mean - k * sd, mean + k * sd];
}

/** Probabilité (approx. normale) d'être en perte après n mains. */
export function probabilityOfLoss(evPerRound: number, sdPerRound: number, rounds: number): number {
  const mean = evPerRound * rounds;
  const sd = sdPerRound * Math.sqrt(rounds);
  return normalCdf(-mean / sd);
}

export function normalCdf(z: number): number {
  // Approximation d'Abramowitz & Stegun (7.1.26), précision ~1e-7.
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

export function evaluateRulesRamp(rules: TableRules, ramp: BetRamp, freqs: Record<number, number>): RampEvaluation {
  return evaluateRamp(ramp, freqs, houseEdge(rules));
}
