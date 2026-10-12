import { DIFFICULTES } from '@/config/difficulte';
import { MULTI } from '@/config/modes';
import type { Question } from '@/types/question';
import type { ConfigPartie } from './partie';
import { rngDepuisChaine, type Rng } from './random';
import { selectionnerQuestions } from './selection';

/** Caractères du code de salon : sans 0/O, 1/I/L, pour se dicter le code sans erreur. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function genererCode(rng: Rng = Math.random): string {
  let code = '';
  for (let i = 0; i < MULTI.longueurCode; i++) code += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  return code;
}

/** Normalise un code saisi (« k7 qf » → « K7QF ») ; null s'il n'est pas valide. */
export function normaliserCode(saisie: string): string | null {
  const code = saisie.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code.length === MULTI.longueurCode && [...code].every((c) => ALPHABET.includes(c)) ? code : null;
}

/** Ancre du lien d'invitation : un simple jeton (#salon-K7QF), qui survit à tous les hébergements. */
export const PREFIXE_ANCRE = 'salon-';

export function codeDepuisAncre(ancre: string): string | null {
  const m = /^#?\/?salon[-/]([A-Za-z0-9]+)$/.exec(ancre);
  return m ? normaliserCode(m[1]!) : null;
}

/** Lien d'invitation : l'adresse publique de l'application (si connue) suivie du jeton du salon. */
export function lienSalon(code: string, base: string): string {
  return `${base.replace(/#.*$/, '')}#${PREFIXE_ANCRE}${code}`;
}

/**
 * Questions d'une partie entre amis : tirées de la banque locale d'origine (identique sur tous
 * les appareils, sans les modifications locales de l'admin), sans médias, avec un tirage
 * déterminé par la graine du salon.
 */
export function questionsDuSalon(banque: Question[], config: ConfigPartie): Question[] {
  const rng = rngDuSalon(config.salon ?? '');
  const triee = banque
    .filter((q) => q.source === 'local' && !q.media && (config.categorie === 'mix' || q.categorie === config.categorie))
    .sort((a, b) => a.id.localeCompare(b.id));
  const niveaux = DIFFICULTES[config.difficulte === 'adaptatif' ? 'moyen' : config.difficulte].niveaux;
  return selectionnerQuestions(triee, { categorie: config.categorie, niveaux, nombre: config.nombreQuestions, rng });
}

export function rngDuSalon(graine: string): Rng {
  return rngDepuisChaine(`quizmania-salon-${graine}`);
}

export type ScoreSalon = { id: string; pseudo: string; score: number; bonnes: number };

/** Classement du salon : score puis bonnes réponses ; les ex æquo partagent le rang. */
export function classerSalon<J extends ScoreSalon>(joueurs: J[]): (J & { rang: number })[] {
  const tries = [...joueurs].sort((a, b) => b.score - a.score || b.bonnes - a.bonnes || a.pseudo.localeCompare(b.pseudo));
  return tries.map((j) => ({ ...j, rang: 1 + tries.filter((x) => x.score > j.score || (x.score === j.score && x.bonnes > j.bonnes)).length }));
}
