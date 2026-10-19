import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp } from "../../lib/utils";
import { Laptop3D } from "../components/Laptop";
import { A } from "../theme";
import { SCREEN_H, SCREEN_W } from "../ui/kit";
import { LANDING_ITEMS, Landing } from "../ui/Landing";
import { LAPTOP_SCALE, LAPTOP_Y, restPose } from "./Scene1Laptop";

/** Position finale de chaque bloc de la landing dans l'espace 3D (z > 0 = vers la caméra). */
const TARGETS: Record<string, { x: number; y: number; z: number; ry: number; rx: number; s: number }> = {
  nav: { x: 0, y: -440, z: -650, ry: 0, rx: 10, s: 0.95 },
  badge: { x: -560, y: -300, z: -120, ry: 18, rx: 4, s: 1.2 },
  title: { x: -60, y: -190, z: -420, ry: 4, rx: 4, s: 0.85 },
  subtitle: { x: 380, y: 330, z: -620, ry: -10, rx: -4, s: 0.9 },
  prompt: { x: 20, y: 40, z: 170, ry: -4, rx: 3, s: 1.1 },
  card1: { x: -660, y: 210, z: -80, ry: 22, rx: -2, s: 0.95 },
  card2: { x: 660, y: -200, z: -260, ry: -22, rx: 4, s: 0.95 },
  card3: { x: 640, y: 270, z: 60, ry: -20, rx: -4, s: 0.9 },
  progress: { x: -400, y: 430, z: 330, ry: 12, rx: -6, s: 0.9 },
};

/** Scène 2 (3-6,5 s) : plongée dans l'écran, les blocs de la landing s'échappent et flottent. */
export const Scene2Dive: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;

  const dive = (f: number) => interpolate(f, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const d = dive(frame);
  const rest = restPose(absFrame - Math.max(0, frame), fps);
  // Échelle de l'écran (×1 → ×2,6 par rapport à la pose de départ)
  const screenScale = (f: number) => LAPTOP_SCALE * lerp(1, 2.6, dive(f));
  const sCur = screenScale(frame);

  const laptopOpacity = interpolate(frame, [44, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const laptopBlur = interpolate(frame, [32, 80], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [42, 64, 104], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const camRy = interpolate(frame, [40, 225], [7, -7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camZ = interpolate(frame, [40, 225], [-60, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const focusZ = interpolate(frame, [70, 165], [-250, 170 + 140 * 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });

  const elementState = (i: number, f: number) => {
    const it = LANDING_ITEMS[i];
    const tg = TARGETS[it.key];
    const p = spring({ frame: f - 46 - i * 2.5, fps, config: { damping: 20, stiffness: 46, mass: 1.1 } });
    const s0 = screenScale(f);
    const cx = (it.x + it.w / 2 - SCREEN_W / 2) * s0;
    const cy = (it.y + it.h / 2 - SCREEN_H / 2) * s0;
    const drift = p * p;
    return {
      p,
      x: lerp(cx, tg.x, p) + Math.sin(t * 0.8 + i * 1.7) * 14 * drift,
      y: lerp(cy, tg.y, p) + Math.cos(t * 0.7 + i * 1.3) * 12 * drift,
      z: lerp(0, tg.z, p) + Math.sin(t * 0.5 + i) * 30 * drift,
      s: lerp(s0, tg.s, p),
      ry: lerp(0, tg.ry, p) + Math.sin(t * 0.6 + i) * 3 * drift,
      rx: lerp(0, tg.rx, p),
    };
  };
  const elementsOpacity = interpolate(frame, [40, 56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Le centre de l'écran se recentre pendant la plongée
  const lidCenterY = lerp(LAPTOP_Y + rest.y, 0, d);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: laptopOpacity, filter: laptopBlur > 0.3 ? `blur(${laptopBlur}px)` : undefined }}>
        <AbsoluteFill style={{ perspective: 2600, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: `translate3d(0, ${lidCenterY}px, 0) scale(${sCur}) rotateX(${lerp(rest.rx, 0, d)}deg) rotateY(${lerp(rest.ry, 0, d)}deg) rotateZ(${lerp(
                rest.rz,
                0,
                d,
              )}deg)`,
            }}
          >
            <Laptop3D rotateY={lerp(rest.ry, 0, d)} lidTilt={lerp(rest.lid, 0, d)} baseOpacity={1 - d}>
              <Landing />
            </Laptop3D>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${A.a(0.34 * flash)} 0%, transparent 70%)` }} />

      <AbsoluteFill style={{ perspective: 1500, opacity: elementsOpacity }}>
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 540,
            transformStyle: "preserve-3d",
            transform: `translateZ(${camZ}px) rotateY(${camRy}deg) rotateX(3deg)`,
          }}
        >
          {LANDING_ITEMS.map((it, i) => {
            const st = elementState(i, frame);
            const prev = elementState(i, frame - 1);
            const speed = Math.hypot(st.x - prev.x, st.y - prev.y, st.z - prev.z);
            const dof = clamp(Math.abs(st.z + camZ - focusZ) / 55, 0, 14) * st.p;
            const blur = dof + clamp(speed * 0.06, 0, 6);
            const isHero = it.key === "prompt";
            return (
              <div
                key={it.key}
                style={{
                  position: "absolute",
                  left: -it.w / 2,
                  top: -it.h / 2,
                  width: it.w,
                  height: it.h,
                  transform: `translate3d(${st.x}px, ${st.y}px, ${st.z}px) rotateY(${st.ry}deg) rotateX(${st.rx}deg) scale(${st.s})`,
                  filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined,
                  boxShadow: isHero ? `0 0 ${70 * st.p}px ${A.a(0.5 * st.p)}` : undefined,
                  borderRadius: 20,
                }}
              >
                {it.node}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
