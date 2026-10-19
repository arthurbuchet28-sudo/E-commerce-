import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG } from "../config";
import { accent } from "../lib/utils";

/** Fond presque noir avec léger dégradé + nébuleuses d'accent qui dérivent lentement. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 70% at 50% 42%, ${CONFIG.background.center} 0%, #07090f 55%, ${CONFIG.background.edge} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          left: 960 - 550 + Math.sin(t * 0.35) * 220,
          top: 540 - 650 + Math.cos(t * 0.27) * 120,
          background: `radial-gradient(circle, ${accent.a(0.12)} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: 1300 + Math.cos(t * 0.3) * 160,
          top: 450 + Math.sin(t * 0.4) * 140,
          background: `radial-gradient(circle, ${accent.a(0.07)} 0%, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Grain filmique très léger + vignettage. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
