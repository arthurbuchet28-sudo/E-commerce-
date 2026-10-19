import React, { useId } from "react";
import { mix } from "../../lib/utils";
import { O, Y } from "../theme";

/**
 * Le fil conducteur : la ligne de lumière orange.
 * - draw : portion tracée (0 → 1)   - heat : 0 = grise et terne, 1 = enflammée (3 couches)
 */
export const Thread: React.FC<{
  d: string;
  width: number;
  height: number;
  draw: number;
  heat: number;
  stroke?: number;
  head?: boolean;
  style?: React.CSSProperties;
}> = ({ d, width, height, draw, heat, stroke = 5, head = true, style }) => {
  const id = "th" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const core = mix("#55525a", "#ffffff", heat);
  const mid = mix("#45424a", O.light, heat);
  const dash = { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - draw };
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
      <defs>
        <filter id={`${id}a`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
        <filter id={`${id}b`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
        <linearGradient id={`${id}g`} x1="0" x2="1">
          <stop offset="0%" stopColor={O.base} />
          <stop offset="100%" stopColor={Y.base} />
        </linearGradient>
      </defs>
      {heat > 0.01 ? (
        <>
          <path d={d} fill="none" stroke={`url(#${id}g)`} strokeWidth={stroke * 5} strokeLinecap="round" filter={`url(#${id}a)`} opacity={0.85 * heat} {...dash} />
          <path d={d} fill="none" stroke={mid} strokeWidth={stroke * 2} strokeLinecap="round" filter={`url(#${id}b)`} opacity={heat} {...dash} />
        </>
      ) : null}
      <path d={d} fill="none" stroke={heat > 0.01 ? core : mid} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" opacity={0.55 + 0.45 * heat} {...dash} />
      {head && draw > 0.01 && draw < 0.995 && heat > 0.3 ? <PathHead d={d} t={draw} /> : null}
    </svg>
  );
};

/** Tête lumineuse sur le chemin (approximée avec un tracé très court en bout). */
const PathHead: React.FC<{ d: string; t: number }> = ({ d, t }) => (
  <path d={d} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`0.004 1`} strokeDashoffset={-(t - 0.004)} style={{ filter: `drop-shadow(0 0 10px ${Y.base}) drop-shadow(0 0 24px ${O.base})` }} />
);
