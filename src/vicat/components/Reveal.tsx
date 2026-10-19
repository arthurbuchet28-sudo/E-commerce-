import React from "react";
import { interpolate, spring } from "remotion";
import { clamp, ease } from "../../lib/utils";

/**
 * Apparition mot par mot : chaque mot monte, se défloute et s'éclaire (ressort amorti).
 * `from` : frame de départ, `stagger` : décalage entre deux mots.
 */
export const WordReveal: React.FC<{
  text: string;
  frame: number;
  fps: number;
  from: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (word: string, i: number) => React.CSSProperties | undefined;
}> = ({ text, frame, fps, from, stagger = 6, style, wordStyle }) => {
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", ...style }}>
      {words.map((w, i) => {
        const p = spring({ frame: frame - from - i * stagger, fps, config: { damping: 18, stiffness: 90 } });
        const blur = (1 - clamp(p)) * 12;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              // padding interne pour que l'arrondi des lettres ne soit jamais rogné par le dégradé
              padding: "0 0.02em 0.08em",
              marginRight: i < words.length - 1 ? "0.24em" : 0,
              opacity: clamp(p * 1.6),
              transform: `translateY(${(1 - p) * 46}px)`,
              filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
              ...wordStyle?.(w, i),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Balayage gauche → droite avec flou (comme le nom « Promptly » dans la scène finale). */
export const Wipe = (frame: number, from: number, to: number) => {
  const r = interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  return {
    clipPath: `inset(-40px ${(1 - r) * 100}% -40px 0)`,
    transform: `translateX(${(1 - r) * -50}px)`,
    filter: r < 1 ? `blur(${(1 - r) * 10}px)` : undefined,
  } as const;
};
