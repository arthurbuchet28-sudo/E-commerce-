import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp } from "../../lib/utils";
import { Laptop3D } from "../components/Laptop";
import { SITE } from "../config";
import { useLayout } from "../layout";
import { A, B, sfont } from "../theme";
import { Landing } from "../ui/Landing";

/** Échelle du laptop : plus grand en 9:16 pour occuper la largeur. */
export const laptopScale = (vertical: boolean) => (vertical ? 0.5 : 0.6);
/** Décalage vertical : la base du laptop étant sous l'écran, on remonte l'ensemble. */
export const laptopY = (vertical: boolean) => (vertical ? 40 : -90);

/** Pose « posée, légèrement de 3/4 », avec un flottement permanent (en temps absolu). */
export const restPose = (absFrame: number, fps: number, vertical = false) => {
  const t = absFrame / fps;
  return {
    rx: -14 + Math.sin(t * 0.9) * 1.2,
    ry: (vertical ? -10 : -18) + Math.sin(t * 0.6) * 2.5,
    rz: -1.5 + Math.sin(t * 0.7) * 0.5,
    y: Math.sin(t * 1.1) * 6,
    lid: 10,
  };
};

/** Scène 1 (0-3 s) : le MacBook arrive en rotation et se pose, la landing apparaît. */
export const Scene1Laptop: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const { cx, cy, vertical } = useLayout();
  const LAPTOP_SCALE = laptopScale(vertical);
  const LAPTOP_Y = laptopY(vertical);

  const pose = (f: number) => {
    const s = spring({ frame: f, fps, config: { damping: 22, stiffness: 48, mass: 1.25 }, durationInFrames: 140 });
    const rest = restPose(absFrame - frame + f, fps, vertical);
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
          left: cx - 700,
          top: cy - 40 + LAPTOP_Y - 600,
          width: 1400,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${A.a(0.22 * halo)} 0%, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - 520,
          top: cy + 360 + LAPTOP_Y * 1.5 + (vertical ? 80 : 0),
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
      {vertical ? <Hook frame={frame} /> : null}
    </AbsoluteFill>
  );
};

/** Accroche en haut de l'écran (version TikTok uniquement). */
const Hook: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ ...sfont, position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
    {SITE.verticalHook.map((line, i) => {
      const p = interpolate(frame, [70 + i * 10, 104 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
      return (
        <div
          key={i}
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            opacity: p,
            transform: `translateY(${(1 - p) * 40}px)`,
            filter: p < 1 ? `blur(${((1 - p) * 10).toFixed(2)}px)` : undefined,
            ...(i === 1
              ? { background: `linear-gradient(90deg, ${A.light}, ${B.light})`, WebkitBackgroundClip: "text", color: "transparent" }
              : {}),
          }}
        >
          {line}
        </div>
      );
    })}
  </div>
);
