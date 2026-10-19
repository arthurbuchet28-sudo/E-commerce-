import React from "react";
import { AbsoluteFill, interpolate } from "remotion";

/** Flash lumineux (blanc 12 % → 0 en 6 frames) — réservé aux 3 impacts majeurs. */
export const Flash: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const o = interpolate(frame, [at, at + 6], [0.12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at || o <= 0) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** Secousse amortie (3 à 6 px, ~10 frames) après un temps fort. */
export const shake = (frame: number, at: number, amp = 6) => {
  const d = frame - at;
  if (d < 0 || d > 12) return { x: 0, y: 0 };
  const k = Math.exp(-d / 3.2) * amp;
  return { x: Math.sin(d * 2.9) * k, y: Math.cos(d * 3.7) * k * 0.8 };
};
