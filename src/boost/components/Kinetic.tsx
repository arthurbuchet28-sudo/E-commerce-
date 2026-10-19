import React from "react";
import { spring } from "remotion";
import { clamp } from "../../lib/utils";
import { O, bfont, ui } from "../theme";

export type Word = { w: string; key?: boolean };

/**
 * Typographie cinétique : les mots arrivent un par un (décalage d'un demi-temps par défaut),
 * ressort + flou 12 → 0 px + montée de 30 px. Le mot-clé fait un petit pop (1,15 → 1).
 */
export const Kinetic: React.FC<{
  words: Word[];
  frame: number; // frame locale
  start: number;
  stagger: number;
  fps: number;
  size: number;
  keyColor?: string;
  color?: string;
  exit?: number; // 0 → 1 : sortie (flou + montée)
  align?: "center" | "left";
  lineHeight?: number;
  maxWidth?: number;
}> = ({ words, frame, start, stagger, fps, size, keyColor = O.base, color = ui.text, exit = 0, align = "center", lineHeight = 1.06, maxWidth = 860 }) => (
  <div
    style={{
      ...bfont,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: "-0.04em",
      lineHeight,
      textAlign: align,
      maxWidth,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: align === "center" ? "center" : "flex-start",
      columnGap: size * 0.26,
      opacity: 1 - exit,
      filter: exit > 0.01 ? `blur(${(exit * 14).toFixed(2)}px)` : undefined,
      transform: `translateY(${-exit * 40}px)`,
    }}
  >
    {words.map((wd, i) => {
      const p = spring({ frame: frame - start - i * stagger, fps, config: { damping: 18, stiffness: 120, mass: 0.8 } });
      const pop = wd.key ? 1 + 0.15 * (1 - spring({ frame: frame - start - i * stagger - 4, fps, config: { damping: 12, stiffness: 160 } })) * clamp(p * 3) : 1;
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            opacity: clamp(p * 1.4),
            transform: `translateY(${(1 - p) * 30}px) scale(${pop})`,
            filter: p < 0.98 ? `blur(${((1 - p) * 12).toFixed(2)}px)` : undefined,
            color: wd.key ? keyColor : color,
            textShadow: wd.key && keyColor === O.base ? `0 0 30px ${O.a(0.45)}` : undefined,
          }}
        >
          {wd.w}
        </span>
      );
    })}
  </div>
);
