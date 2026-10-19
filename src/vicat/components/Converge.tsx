import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { ease } from "../../lib/utils";
import { A, G, blueBright } from "../theme";

/** Particules qui convergent vers le centre avec traînées (repris de la scène finale Promptly). */
export const Converge: React.FC<{ frame: number; W: number; H: number; count?: number; start?: number; seed?: string }> = ({
  frame,
  W,
  H,
  count = 80,
  start = -12,
  seed = "c",
}) => {
  const conv = (f: number, i: number) => {
    const delay = random(`${seed}d-${i}`) * 18;
    return interpolate(f, [start + delay, start + 52 + delay * 0.6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.in,
    });
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id={`${seed}streak`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const a = random(`${seed}a-${i}`) * Math.PI * 2;
        const r0 = 700 + random(`${seed}r-${i}`) * 700;
        const p = conv(frame, i);
        const pPrev = conv(frame - 3, i);
        if (p <= 0 || p >= 1) return null;
        const r = r0 * (1 - p);
        const rPrev = r0 * (1 - pPrev);
        const x1 = W / 2 + Math.cos(a) * r;
        const y1 = H / 2 + Math.sin(a) * r;
        const x2 = W / 2 + Math.cos(a) * rPrev;
        const y2 = H / 2 + Math.sin(a) * rPrev;
        const w = 1.5 + random(`${seed}w-${i}`) * 2.5;
        const blue = i % 3 !== 0;
        return (
          <g key={i} opacity={Math.sin(p * Math.PI) * 0.85 + 0.1}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={blue ? blueBright : G.base} strokeWidth={w * 3} strokeLinecap="round" filter={`url(#${seed}streak)`} opacity={0.5} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={blue ? A.base : G.deep} strokeWidth={w} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/** Cœur lumineux (halo bleu sur fond clair). */
export const Core: React.FC<{ intensity: number }> = ({ intensity }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.9 * intensity}) 0%, ${A.a(0.22 * intensity)} 8%, ${A.a(
        0.07 * intensity,
      )} 24%, transparent 45%)`,
    }}
  />
);
