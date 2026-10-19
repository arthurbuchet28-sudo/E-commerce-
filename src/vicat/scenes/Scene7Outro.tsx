import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease } from "../../lib/utils";
import { VICAT } from "../config";
import { Converge, Core } from "../components/Converge";
import { PictoFleche } from "../components/Pictos";
import { VicatLogo } from "../components/VicatLogo";
import { A, brandGradient, halo, vfont } from "../theme";

const LOGO_W = 640;

/** Scène 7 (20-23 s) : convergence, logo, question et bouton « vicat.fr » qui pop. */
export const Scene7Outro: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const { width: W, height: H } = useVideoConfig();
  const t = absFrame / fps;

  const core = interpolate(frame, [24, 42, 100], [0, 1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const draw = interpolate(frame, [18, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const fill = interpolate(frame, [58, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const logoIn = spring({ frame: frame - 16, fps, config: { damping: 18, stiffness: 70 } });

  // Le logo remonte pour laisser la place à la question et au bouton
  const slide = spring({ frame: frame - 74, fps, config: { damping: 20, stiffness: 70, mass: 1 } });
  const question = spring({ frame: frame - 90, fps, config: { damping: 18, stiffness: 90 } });
  const pop = spring({ frame: frame - 108, fps, config: { damping: 10, stiffness: 150, mass: 0.7 } });
  const shimmer = interpolate(frame, [130, 165], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const breathe = 1 + Math.sin(t * 2.2) * 0.01 * fill;

  return (
    <AbsoluteFill>
      <Converge frame={frame} W={W} H={H} seed="outro" />
      <Core intensity={core} />
      <AbsoluteFill style={{ ...vfont, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            top: H / 2 - LOGO_W / 2 / 4.908 - slide * 150,
            transform: `scale(${(0.72 + 0.28 * logoIn) * breathe})`,
            opacity: clamp(logoIn * 2),
            filter: `drop-shadow(0 18px 40px ${A.a(0.18 * fill)})`,
          }}
        >
          <VicatLogo width={LOGO_W} draw={draw} fill={fill} />
        </div>
        {/* Question */}
        <div
          style={{
            position: "absolute",
            top: H / 2 + 10,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
            opacity: clamp(question * 1.5),
            transform: `translateY(${(1 - question) * 30}px)`,
            filter: question < 0.98 ? `blur(${(1 - clamp(question)) * 10}px)` : undefined,
          }}
        >
          {VICAT.question}
        </div>
        {/* Bouton */}
        <div style={{ position: "absolute", top: H / 2 + 128 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "24px 56px",
              borderRadius: 999,
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: -0.3,
              color: "#fff",
              background: brandGradient(100),
              boxShadow: `${halo(1.2 * pop)}, 0 18px 40px ${A.a(0.28)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
              transform: `scale(${Math.max(0, pop)})`,
              opacity: clamp(pop * 3),
              overflow: "hidden",
            }}
          >
            {VICAT.url}
            <PictoFleche size={36} stroke={2.6} color="#fff" />
            {/* Reflet qui balaie le bouton */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${shimmer}%`,
                width: "30%",
                background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
