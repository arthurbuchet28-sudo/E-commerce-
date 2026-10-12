/** Générateur pseudo-aléatoire : renvoie un nombre dans [0, 1). */
export type Rng = () => number;

/** PRNG mulberry32 : rapide, déterministe, suffisant pour un jeu. */
export function mulberry32(graine: number): Rng {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hache une chaîne en entier 32 bits (FNV-1a). */
export function hacherChaine(texte: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function rngDepuisChaine(texte: string): Rng {
  return mulberry32(hacherChaine(texte));
}

export function rngAleatoire(): Rng {
  return mulberry32((Math.random() * 2 ** 32) >>> 0);
}

/** Mélange de Fisher-Yates, sans modifier le tableau d'origine. */
export function melanger<T>(tableau: readonly T[], rng: Rng): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

export function piocher<T>(tableau: readonly T[], rng: Rng): T {
  if (tableau.length === 0) throw new Error('piocher : tableau vide');
  return tableau[Math.floor(rng() * tableau.length)]!;
}
