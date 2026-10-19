import React from "react";
import { interpolate, spring } from "remotion";
import { ease } from "../../lib/utils";
import { LightTrail } from "../../site/components/LightTrail";
import { A, trail, ui, vfont } from "../theme";

/**
 * Grande carte 3D de la scène « chiffre clé » de Promptly, en version claire :
 * arrive du fond, oscille doucement, traînées de lumière sur le contour, onde au moment fort.
 */
export const GlowCard: React.FC<{
  frame: number;
  t: number;
  fps: number;
  width: number;
  height: number;
  /** Frame du « moment fort » (onde + halo renforcé). */
  pulseAt?: number;
  radius?: number;
  children: React.ReactNode;
}> = ({ frame, t, fps, width, height, pulseAt = 9999, radius = 48, children }) => {
  const enter = spring({ frame: frame + 6, fps, config: { damping: 22, stiffness: 60 } });
  const done = spring({ frame: frame - pulseAt, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const pulse = interpolate(frame, [pulseAt, pulseAt + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const trailOffset = -interpolate(frame, [-12, 240], [0.05, 1.9], { easing: ease.soft });
  const trailOn = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ry = -4 + Math.sin(t * 0.55) * 4;
  const rx = 6 * (1 - enter) + 4 + Math.sin(t * 0.7) * 1.2;
  const camScale = interpolate(frame, [0, 240], [1, 1.05]);

  return (
    <div style={{ position: "relative", width, height, perspective: 1800 }}>
      <div
        style={{
          position: "absolute",
          left: -250,
          right: -250,
          top: -200,
          bottom: -200,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${A.a(0.1 + 0.06 * done)} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `scale(${camScale}) translateZ(${-500 * (1 - enter)}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            border: `2px solid ${A.base}`,
            transform: `scale(${1 + pulse * 0.14})`,
            opacity: pulse > 0 ? (1 - pulse) * 0.6 : 0,
          }}
        />
        <div
          style={{
            ...vfont,
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            overflow: "hidden",
            background: ui.card,
            border: `1px solid ${ui.border}`,
            boxShadow: `${ui.shadow}, 0 0 ${60 + 50 * done}px ${A.a(0.1 + 0.08 * done)}, inset 0 1px 0 #fff`,
            boxSizing: "border-box",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 90% at 8% 0%, ${A.a(0.07)} 0%, transparent 60%)` }} />
          {children}
        </div>
        <LightTrail width={width} height={height} radius={radius} offset={trailOffset} length={0.16} intensity={trailOn} {...trail} />
        <LightTrail width={width} height={height} radius={radius} offset={trailOffset + 0.5} length={0.07} intensity={trailOn * 0.55} {...trail} />
      </div>
    </div>
  );
};

/** Pastille d'icône (bleu Vicat), en tête de carte. */
export const IconTile: React.FC<{ size?: number; children: React.ReactNode }> = ({ size = 76, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      background: A.a(0.08),
      border: `1px solid ${A.a(0.22)}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);
