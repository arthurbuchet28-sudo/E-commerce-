import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp } from "../../lib/utils";
import { Laptop3D } from "../components/Laptop";
import { A } from "../theme";
import { Landing } from "../ui/Landing";

export const LAPTOP_SCALE = 0.6;
/** Décalage vertical : la base du laptop étant sous l'écran, on remonte l'ensemble. */
export const LAPTOP_Y = -90;

/** Pose « posée, légèrement de 3/4 », avec un flottement permanent (en temps absolu). */
export const restPose = (absFrame: number, fps: number) => {
  const t = absFrame / fps;
  return {
    rx: -14 + Math.sin(t * 0.9) * 1.2,
    ry: -18 + Math.sin(t * 0.6) * 2.5,
    rz: -1.5 + Math.sin(t * 0.7) * 0.5,
    y: Math.sin(t * 1.1) * 6,
    lid: 10,
  };
};

/** Scène 1 (0-3 s) : le MacBook arrive en rotation et se pose, la landing apparaît. */
export const Scene1Laptop: React.FC = () => {
  const { frame, absFrame, fps } = useScene();

  const pose = (f: number) => {
    const s = spring({ frame: f, fps, config: { damping: 22, stiffness: 48, mass: 1.25 }, durationInFrames: 140 });
    const rest = restPose(absFrame - frame + f, fps);
    return {
      s,
      rx: lerp(30, rest.rx, s),
      ry: lerp(200, rest.ry, s),
      rz: lerp(-20, rest.rz, s),
      y: lerp(800, rest.y, s),
      z: lerp(-1400, 0, s),
      lid: rest.lid,
    };
  };
  const p = pose(frame);
  const prev = pose(frame - 1);
  const blur = clamp(Math.abs(p.ry - prev.ry) * 0.32 + Math.abs(p.y - prev.y) * 0.05 + Math.abs(p.z - prev.z) * 0.02, 0, 9);
  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reveal = (i: number) =>
    interpolate(frame, [60 + i * 5, 92 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const halo = interpolate(p.s, [0.3, 1], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 960 - 700,
          top: 500 - 600,
          width: 1400,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${A.a(0.22 * halo)} 0%, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960 - 520,
          top: 900,
          width: 1040,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${A.a(0.32 * halo)} 0%, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />
      <AbsoluteFill style={{ opacity, filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <AbsoluteFill style={{ perspective: 2600, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: `translate3d(0, ${LAPTOP_Y + p.y}px, ${p.z}px) scale(${LAPTOP_SCALE}) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`,
            }}
          >
            <Laptop3D rotateY={p.ry} lidTilt={p.lid}>
              <Landing reveal={reveal} />
            </Laptop3D>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
