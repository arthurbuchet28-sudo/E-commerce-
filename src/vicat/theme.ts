import { makePalette, mix, rgba } from "../lib/utils";
import { VICAT } from "./config";

/** Palettes dérivées des couleurs de la config (fond clair : les « glows » deviennent des halos doux). */
export const A = makePalette(VICAT.accent);
export const G = makePalette(VICAT.concrete);

/** Bleu un peu plus lumineux que le bleu logo, pour les traits et dégradés. */
export const blueBright = mix(VICAT.accent, "#3B8FE0", 0.55);

/** Dégradé signature : bleu lumineux → bleu Vicat → bleu profond. */
export const brandGradient = (angle = 135) => `linear-gradient(${angle}deg, ${blueBright} 0%, ${A.base} 60%, ${A.deep} 120%)`;

export const ui = {
  text: VICAT.text,
  muted: "#59606A",
  faint: "#7A8089",
  border: "rgba(20, 40, 70, 0.09)",
  card: "linear-gradient(150deg, #FFFFFF 0%, #F7F6F3 60%, #EFEDE8 100%)",
  shadow: "0 50px 110px rgba(16, 32, 60, 0.16), 0 12px 30px rgba(16, 32, 60, 0.08)",
};

export const vfont = {
  fontFamily: VICAT.fontFamily,
  color: ui.text,
  WebkitFontSmoothing: "antialiased",
} as const;

/** Halo bleu doux (équivalent clair du glow néon de Promptly). */
export const halo = (strength = 1) =>
  [`0 0 ${18 * strength}px ${rgba(VICAT.accent, 0.16)}`, `0 0 ${60 * strength}px ${rgba(VICAT.accent, 0.12)}`].join(", ");

/** Couleurs des traînées de lumière sur fond clair. */
export const trail = { color: blueBright, light: mix(blueBright, "#ffffff", 0.35), core: "#ffffff" };
