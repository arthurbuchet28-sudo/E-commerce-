import { makePalette, mix } from "../lib/utils";
import { BOOST } from "./config";

export const O = makePalette(BOOST.accent); // orange
export const Y = makePalette(BOOST.accent2); // ambre

export const flame = (angle = 135) => `linear-gradient(${angle}deg, ${Y.base} 0%, ${O.base} 55%, ${O.deep} 130%)`;

export const ui = {
  card: "rgba(255,255,255,0.06)",
  cardSolid: mix(BOOST.black, "#ffffff", 0.05),
  border: "rgba(255,255,255,0.08)",
  text: "#F7F4F2",
  muted: "#8E8892",
  grey: "#6E6A73",
};

/** Deux graisses seulement : 800 (titres) et 500 (le reste). */
export const bfont = {
  fontFamily: BOOST.fontFamily,
  color: ui.text,
  fontWeight: 500,
  WebkitFontSmoothing: "antialiased",
} as const;

const NB = " ";
/** Format français : 1234 → « 1 234 », 1 200 000 → « 1,2 M ». */
export const formatViews = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")}\u00A0M`;
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NB);
};
