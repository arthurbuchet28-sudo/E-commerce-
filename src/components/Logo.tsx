import React, { useId } from "react";
import { accent, clamp } from "../lib/utils";

/**
 * Logo de l'app : un carré arrondi + une pulsation (ligne d'ECG).
 * - draw : progression du tracé lumineux (0 → 1)
 * - fill : remplissage final de la tuile (0 → 1)
 */
export const LogoMark: React.FC<{
  size: number;
  draw: number;
  fill: number;
  glowStrength?: number;
}> = ({ size, draw, fill, glowStrength = 1 }) => {
  const id = "logo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const tile = "M60 10 H140 A50 50 0 0 1 190 60 V140 A50 50 0 0 1 140 190 H60 A50 50 0 0 1 10 140 V60 A50 50 0 0 1 60 10 Z";
  const pulse = "M34 104 H70 L86 66 L108 142 L126 86 L138 104 H166";
  const dTile = clamp(draw * 1.35);
  const dPulse = clamp(draw * 1.6 - 0.6);
  const strokeColor = (t: number) => (t > 0.5 ? "#ffffff" : accent.light);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent.light} />
          <stop offset="100%" stopColor={accent.deep} />
        </linearGradient>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      {/* Remplissage */}
      <path d={tile} fill={`url(#${id}g)`} opacity={fill} />
      {/* Bloom (traits flous) */}
      <g filter={`url(#${id}b)`} opacity={0.9 * glowStrength}>
        <path d={tile} fill="none" stroke={accent.base} strokeWidth={16} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dTile} />
        <path d={pulse} fill="none" stroke={accent.light} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dPulse} />
      </g>
      {/* Traits nets */}
      <path d={tile} fill="none" stroke={accent.light} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dTile} strokeLinecap="round" />
      <path
        d={pulse}
        fill="none"
        stroke={strokeColor(fill)}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - dPulse}
      />
    </svg>
  );
};
