import React, { useId } from "react";
import { clamp } from "../../lib/utils";
import { O, Y } from "../theme";

/** Chemins du logo (repère 200×200) : bulle de lecture + flèche montante. */
export const LOGO_BUBBLE =
  "M58 22 H142 A40 40 0 0 1 182 62 V122 A40 40 0 0 1 142 162 H92 L60 188 L64 162 H58 A40 40 0 0 1 18 122 V62 A40 40 0 0 1 58 22 Z";
export const LOGO_ARROW = "M56 128 L88 96 L108 114 L146 70 M118 70 H146 V98";

/** Logo : draw = tracé lumineux (0 → 1), fill = remplissage dégradé (0 → 1). */
export const BoostLogo: React.FC<{ size: number; draw: number; fill: number; glowStrength?: number }> = ({ size, draw, fill, glowStrength = 1 }) => {
  const id = "bl" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const dB = clamp(draw * 1.35);
  const dA = clamp(draw * 1.8 - 0.8);
  const dash = (v: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - v });
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={Y.base} />
          <stop offset="60%" stopColor={O.base} />
          <stop offset="120%" stopColor={O.deep} />
        </linearGradient>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <path d={LOGO_BUBBLE} fill={`url(#${id}g)`} opacity={fill} />
      <g filter={`url(#${id}b)`} opacity={0.9 * glowStrength}>
        <path d={LOGO_BUBBLE} fill="none" stroke={O.base} strokeWidth={16} strokeLinejoin="round" {...dash(dB)} />
        <path d={LOGO_ARROW} fill="none" stroke={Y.light} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" {...dash(dA)} />
      </g>
      <path d={LOGO_BUBBLE} fill="none" stroke={O.light} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" {...dash(dB)} />
      <path d={LOGO_ARROW} fill="none" stroke={fill > 0.5 ? "#fff" : Y.pale} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" {...dash(dA)} />
    </svg>
  );
};
