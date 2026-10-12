import { type Card, type UpValue, UP_VALUES, cardFromUpValue } from './cards';
import { type Rng, defaultRng, pick, randInt } from './rng';
import { type HandKind, type Situation } from './strategy';

/** Toutes les situations des tableaux (dures 5-17, soft 13-20, paires). */
export function allSituations(): Situation[] {
  const out: Situation[] = [];
  for (const dealer of UP_VALUES) {
    for (let t = 8; t <= 17; t++) out.push({ kind: 'hard', value: t, dealer });
    for (let t = 13; t <= 20; t++) out.push({ kind: 'soft', value: t, dealer });
    for (const v of [2, 3, 4, 6, 7, 8, 9, 10, 11]) out.push({ kind: 'pair', value: v, dealer });
  }
  return out;
}

export function randomSituation(rng: Rng = defaultRng, kinds: HandKind[] = ['hard', 'soft', 'pair']): Situation {
  const kind = pick(kinds, rng);
  const dealer = pick(UP_VALUES, rng);
  if (kind === 'hard') return { kind, value: randInt(8, 17, rng), dealer };
  if (kind === 'soft') return { kind, value: randInt(13, 20, rng), dealer };
  return { kind, value: pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], rng), dealer };
}

/** Construit deux cartes concrètes correspondant à une situation. */
export function cardsForSituation(s: Situation, rng: Rng = defaultRng): { player: Card[]; dealer: Card } {
  const dealer = cardFromUpValue(s.dealer as UpValue, rng);
  if (s.kind === 'pair') {
    const v = s.value as UpValue;
    return { player: [cardFromUpValue(v, rng), cardFromUpValue(v, rng)], dealer };
  }
  if (s.kind === 'soft') {
    return { player: [cardFromUpValue(11, rng), cardFromUpValue((s.value - 11) as UpValue, rng)], dealer };
  }
  // Main dure à deux cartes non paires (5 à 19).
  const t = s.value;
  const options: [number, number][] = [];
  for (let a = 2; a <= 10; a++) {
    const b = t - a;
    if (b >= 2 && b <= 10 && a !== b && a < b) options.push([a, b]);
  }
  if (options.length === 0) {
    // 4 = 2,2 ; 20 = 10,10 : pas de main dure non paire possible, on utilise trois cartes.
    return { player: [cardFromUpValue(2, rng), cardFromUpValue(2, rng), cardFromUpValue((t - 4) as UpValue, rng)], dealer };
  }
  const [a, b] = pick(options, rng);
  const pairCards = rng() < 0.5 ? [a, b] : [b, a];
  return { player: pairCards.map((v) => cardFromUpValue(v as UpValue, rng)), dealer };
}
