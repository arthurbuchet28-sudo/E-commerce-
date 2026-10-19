import React, { useId } from "react";
import { clamp } from "../../lib/utils";
import { A, B } from "../theme";

/**
 * Logo : carré arrondi + triangle « play » + petite étincelle à 4 branches.
 * - draw : progression du tracé lumineux (0 → 1)
 * - fill : remplissage final (0 → 1) ; le trait du play devient blanc
 */
export const SiteLogoMark: React.FC<{ size: number; draw: number; fill: number; glowStrength?: number }> = ({
  size,
  draw,
  fill,
  glowStrength = 1,
}) => {
  const id = "slogo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const tile = "M60 10 H140 A50 50 0 0 1 190 60 V140 A50 50 0 0 1 140 190 H60 A50 50 0 0 1 10 140 V60 A50 50 0 0 1 60 10 Z";
  const play = "M74 62 L140 100 L74 138 Z";
  const spark = "M150 34 Q152 48 166 50 Q152 52 150 66 Q148 52 134 50 Q148 48 150 34 Z";
  const dTile = clamp(draw * 1.4);
  const dPlay = clamp(draw * 1.7 - 0.55);
  const dSpark = clamp(draw * 2.2 - 1.2);
  const dash = (d: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - d });
  const playStroke = fill > 0.5 ? "#ffffff" : A.light;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={A.light} />
          <stop offset="55%" stopColor={A.base} />
          <stop offset="120%" stopColor={B.base} />
        </linearGradient>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <path d={tile} fill={`url(#${id}g)`} opacity={fill} />
      <path d={play} fill="#fff" opacity={fill * 0.18} />
      {/* Bloom */}
      <g filter={`url(#${id}b)`} opacity={0.9 * glowStrength}>
        <path d={tile} fill="none" stroke={A.base} strokeWidth={16} {...dash(dTile)} />
        <path d={play} fill="none" stroke={B.light} strokeWidth={16} strokeLinejoin="round" {...dash(dPlay)} />
        <path d={spark} fill="none" stroke={B.light} strokeWidth={10} {...dash(dSpark)} />
      </g>
      {/* Traits nets */}
      <path d={tile} fill="none" stroke={A.light} strokeWidth={6} strokeLinecap="round" {...dash(dTile)} />
      <path d={play} fill="none" stroke={playStroke} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" {...dash(dPlay)} />
      <path d={spark} fill={fill > 0.5 ? "#fff" : "none"} fillOpacity={fill} stroke={fill > 0.5 ? "#fff" : B.pale} strokeWidth={4} strokeLinejoin="round" {...dash(dSpark)} />
    </svg>
  );
};
