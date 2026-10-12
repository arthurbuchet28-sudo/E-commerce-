/**
 * Générateurs pseudo-aléatoires.
 * `mulberry32` permet d'obtenir des séquences reproductibles (tests, sabots rejouables).
 */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const defaultRng: Rng = Math.random;

/** Entier uniforme dans [min, max] (bornes incluses). */
export function randInt(min: number, max: number, rng: Rng = defaultRng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(items: readonly T[], rng: Rng = defaultRng): T {
  if (items.length === 0) throw new Error('pick: liste vide');
  return items[Math.floor(rng() * items.length)];
}

/** Mélange de Fisher-Yates (en place) — chaque permutation est équiprobable. */
export function shuffleInPlace<T>(items: T[], rng: Rng = defaultRng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
