import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { Phone3D } from "../components/Phone";
import { useScene } from "../lib/scene";
import { accent, clamp, ease, lerp } from "../lib/utils";
import { HomeScreen } from "../ui/HomeScreen";

export const PHONE_SCALE = 0.95;

/** Pose « posée, légèrement inclinée », avec un flottement permanent (en temps absolu). */
export const restPose = (absFrame: number, fps: number) => {
  const t = absFrame / fps;
  return {
    rx: 9 + Math.sin(t * 0.9) * 1.2,
    ry: -21 + Math.sin(t * 0.6) * 2.5,
    rz: -3.5 + Math.sin(t * 0.7) * 0.6,
    y: Math.sin(t * 1.1) * 6,
  };
};

/** Scène 1 (0-3 s) : l'iPhone arrive en rotation et se pose. */
export const Scene1Phone: React.FC = () => {
  const { frame, absFrame, fps } = useScene();

  const arrival = (f: number) =>
    spring({ frame: f, fps, config: { damping: 22, stiffness: 48, mass: 1.25 }, durationInFrames: 140 });

  const pose = (f: number) => {
    const s = arrival(f);
    const rest = restPose(absFrame - frame + f, fps);
    return {
      rx: lerp(38, rest.rx, s),
      ry: lerp(200, rest.ry, s),
      rz: lerp(-28, rest.rz, s),
      y: lerp(820, rest.y, s),
      z: lerp(-1400, 0, s),
      s,
    };
  };

  const p = pose(frame);
  const prev = pose(frame - 1);
  // Flou de mouvement proportionnel à la vitesse (rotation + translation)
  const blur = clamp(Math.abs(p.ry - prev.ry) * 0.32 + Math.abs(p.y - prev.y) * 0.05 + Math.abs(p.z - prev.z) * 0.02, 0, 9);

  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Apparition progressive de l'interface une fois le téléphone presque posé
  const reveal = (i: number) =>
    interpolate(frame, [55 + i * 5, 85 + i * 5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.out,
    });

  const halo = interpolate(p.s, [0.3, 1], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      {/* Halo derrière le téléphone */}
      <div
        style={{
          position: "absolute",
          left: 960 - 520,
          top: 540 - 520,
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent.a(0.22 * halo)} 0%, transparent 60%)`,
        }}
      />
      {/* Reflet au sol */}
      <div
        style={{
          position: "absolute",
          left: 960 - 260,
          top: 940,
          width: 520,
          height: 90,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent.a(0.35 * halo)} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      <AbsoluteFill
        style={{
          perspective: 2200,
          alignItems: "center",
          justifyContent: "center",
          opacity,
          filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `translate3d(0, ${p.y}px, ${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${PHONE_SCALE})`,
          }}
        >
          <Phone3D rotateY={p.ry}>
            <HomeScreen reveal={reveal} />
          </Phone3D>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
