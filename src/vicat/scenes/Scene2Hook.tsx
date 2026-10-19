import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useScene } from "../../lib/scene";
import { ease } from "../../lib/utils";
import { VICAT } from "../config";
import { WordReveal } from "../components/Reveal";
import { A, blueBright, brandGradient, trail, vfont } from "../theme";

const SIZE = 132;

/** Scène 2 (3-6,5 s) : l'accroche officielle, mot par mot, soulignée par une traînée de lumière. */
export const Scene2Hook: React.FC = () => {
  const { frame, fps } = useScene();
  const push = interpolate(frame, [-12, 222], [1, 1.05]);

  // Trait lumineux qui se dessine sous la 2e ligne
  const line = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const comet = interpolate(frame, [70, 200], [-0.1, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.soft });
  const LINE_W = 900;

  const title: React.CSSProperties = {
    fontSize: SIZE,
    fontWeight: 800,
    letterSpacing: "-0.035em",
    lineHeight: 1.12,
  };

  return (
    <AbsoluteFill style={{ ...vfont, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${push}) translateY(-10px)` }}>
        <WordReveal text={VICAT.hook[0]} frame={frame} fps={fps} from={4} stagger={7} style={title} />
        <WordReveal
          text={VICAT.hook[1]}
          frame={frame}
          fps={fps}
          from={46}
          stagger={8}
          style={title}
          wordStyle={() => ({
            background: brandGradient(180),
            WebkitBackgroundClip: "text",
            color: "transparent",
          })}
        />
        <svg width={LINE_W} height={40} viewBox={`0 0 ${LINE_W} 40`} style={{ marginTop: 18, overflow: "visible" }}>
          <defs>
            <filter id="hookBloom" x="-10%" y="-200%" width="120%" height="500%">
              <feGaussianBlur stdDeviation={6} />
            </filter>
            {/* userSpaceOnUse : une ligne horizontale a une boîte de hauteur nulle */}
            <linearGradient id="hookFade" gradientUnits="userSpaceOnUse" x1={0} x2={LINE_W} y1={0} y2={0}>
              <stop offset="0" stopColor={A.base} stopOpacity={0} />
              <stop offset="0.5" stopColor={A.base} stopOpacity={0.9} />
              <stop offset="1" stopColor={A.base} stopOpacity={0} />
            </linearGradient>
          </defs>
          <line x1={LINE_W / 2 - (LINE_W / 2) * line} x2={LINE_W / 2 + (LINE_W / 2) * line} y1={20} y2={20} stroke="url(#hookFade)" strokeWidth={3} strokeLinecap="round" />
          {comet > 0 && comet < 1.1 ? (
            <g>
              <line x1={comet * LINE_W - 120} x2={comet * LINE_W} y1={20} y2={20} stroke={blueBright} strokeWidth={14} strokeLinecap="round" filter="url(#hookBloom)" opacity={0.7} />
              <line x1={comet * LINE_W - 70} x2={comet * LINE_W} y1={20} y2={20} stroke={trail.core} strokeWidth={3} strokeLinecap="round" />
            </g>
          ) : null}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
