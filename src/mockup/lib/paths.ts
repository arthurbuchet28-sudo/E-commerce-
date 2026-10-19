import { interpolate, spring } from "remotion";
import { ease, lerp } from "../../lib/utils";
import { T } from "../config";
import { CURSOR_START, PLAY_BUTTON } from "../components/ScreenPlayer";
import { TRACKPAD } from "./geometry";

type Pt = { x: number; y: number };
const bezier = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Point de contact sur le trackpad (repère de la base) : glisse vers le haut-droite pendant le « slide ». */
export const contactPoint = (frame: number) => {
  const s = interpolate(frame, [T.slide, T.click - 4], [0, 1], { ...clampOpt, easing: ease.inOut });
  return { u: TRACKPAD.u + lerp(-70, -15, s), v: TRACKPAD.v + lerp(60, 15, s), s };
};

/**
 * État de la main. Les décalages (dx, dy) sont en pixels « main » (multipliés ensuite
 * par l'échelle de perspective) par rapport au point de contact projeté.
 */
export const handState = (frame: number, fps: number) => {
  const t = frame / fps;
  // Approche : ressort le long d'une Bézier, depuis le bas à droite hors champ
  const a = spring({ frame: frame - T.handIn, fps, config: { damping: 20, stiffness: 60 }, durationInFrames: T.land - T.handIn + 10 });
  const hover = { x: 60, y: -90 };
  const far = { x: 1300, y: 1100 };
  const appr = bezier(far, { x: 900, y: 500 }, { x: 260, y: 120 }, hover, Math.min(1, a));
  // Pose du doigt
  const land = interpolate(frame, [T.land, T.slide], [0, 1], { ...clampOpt, easing: ease.inOut });
  // Retrait
  const out = interpolate(frame, [T.handOut, T.handOut + 80], [0, 1], { ...clampOpt, easing: ease.inOut });
  const outPt = bezier({ x: 0, y: 0 }, { x: 120, y: 140 }, { x: 700, y: 600 }, far, out);
  // Clic
  const press = interpolate(frame, [T.click, T.click + 5, T.click + 12], [0, 1, 0], { ...clampOpt, easing: ease.inOut });

  let x = lerp(appr.x, 0, land);
  let y = lerp(appr.y, 0, land);
  if (out > 0) {
    x = outPt.x;
    y = outPt.y;
  }
  const lift = Math.max(1 - land, interpolate(out, [0, 0.25], [0, 1], clampOpt));
  // Micro-mouvements vivants
  const jx = Math.sin(t * 7.3) * 0.8 + Math.sin(t * 3.1 + 1) * 0.7;
  const jy = Math.cos(t * 6.1) * 0.7 + Math.sin(t * 2.3 + 2) * 0.6;
  const rot = -24 + Math.sin(t * 1.7) * 0.5 + (1 - a) * 8 + out * 6;
  const visible = frame >= T.handIn - 2 && out < 1;
  return { x: x + jx * (1 - lift * 0.5), y: y + jy, lift, press, rot, visible, approach: a };
};

/** Position du curseur dans l'écran (repère 1280×800). */
export const cursorState = (frame: number) => {
  const { s } = contactPoint(frame);
  const target = { x: PLAY_BUTTON.x + 4, y: PLAY_BUTTON.y + 6 };
  const opacity = interpolate(frame, [T.click + 80, T.click + 96], [1, 0], clampOpt);
  return { x: lerp(CURSOR_START.x, target.x, s), y: lerp(CURSOR_START.y, target.y, s), opacity };
};
