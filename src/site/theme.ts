import { makePalette, mix } from "../lib/utils";
import { SITE } from "./config";

/** Palettes dérivées des deux couleurs de la config. */
export const A = makePalette(SITE.accent);
export const B = makePalette(SITE.accent2);

/** Dégradé signature accent → accent2. */
export const brandGradient = (angle = 135) => `linear-gradient(${angle}deg, ${A.light} 0%, ${A.base} 45%, ${B.base} 120%)`;

export const ui = {
  bg: "#08070F",
  card: "rgba(255,255,255,0.06)",
  cardSolid: mix(SITE.background.center, "#000000", 0.25),
  border: "rgba(255,255,255,0.08)",
  text: "#F5F6FB",
  muted: "#8B93A7",
  faint: "#4A4F63",
  radius: 22,
};

export const sfont = {
  fontFamily: SITE.fontFamily,
  color: ui.text,
  WebkitFontSmoothing: "antialiased",
} as const;

/** 12400 → "12 400" (espace fine insécable, format français). */
export const formatInt = (v: number) =>
  Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
