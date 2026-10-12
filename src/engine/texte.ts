/** Supprime les accents (é → e, ç → c, œ → oe…). */
export function sansAccents(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE');
}

const ARTICLES = /^(le|la|les|l|un|une|des|du|de la|de l|de|d|the|a|an)\s+/;

/**
 * Normalise un texte pour le comparer : minuscules, sans accents,
 * sans ponctuation, sans article initial, espaces compactés.
 */
export function normaliserTexte(texte: string): string {
  let t = sansAccents(texte.toLowerCase())
    .replace(/['’`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // On retire les articles en tête (éventuellement plusieurs : « de la »).
  let precedent = '';
  while (precedent !== t) {
    precedent = t;
    t = t.replace(ARTICLES, '');
  }
  return t;
}

/** Clé de dédoublonnage d'un énoncé. */
export function cleEnonce(enonce: string): string {
  return normaliserTexte(enonce);
}
