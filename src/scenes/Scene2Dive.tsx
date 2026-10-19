import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { Phone3D } from "../components/Phone";
import { useScene } from "../lib/scene";
import { accent, clamp, ease, lerp } from "../lib/utils";
import { HOME_ITEMS, HomeScreen } from "../ui/HomeScreen";
import { SCREEN_H, SCREEN_W } from "../ui/kit";
import { PHONE_SCALE, restPose } from "./Scene1Phone";

/** Position finale de chaque élément d'interface dans l'espace 3D (px, z > 0 = vers la caméra). */
const TARGETS: Record<string, { x: number; y: number; z: number; ry: number; rx: number; s: number }> = {
  header: { x: -470, y: -350, z: -420, ry: 16, rx: 6, s: 1.5 },
  goal: { x: -560, y: -60, z: -160, ry: 20, rx: 4, s: 1.5 },
  record: { x: 60, y: 10, z: 160, ry: -6, rx: 4, s: 1.6 },
  today: { x: 560, y: -320, z: -380, ry: -18, rx: 6, s: 1.5 },
  start: { x: -330, y: 330, z: 420, ry: 14, rx: -4, s: 1.6 },
  ex1: { x: 620, y: -40, z: -120, ry: -22, rx: 2, s: 1.45 },
  ex2: { x: 680, y: 130, z: -320, ry: -24, rx: -2, s: 1.45 },
  ex3: { x: 560, y: 290, z: 40, ry: -18, rx: -4, s: 1.45 },
  tabbar: { x: -80, y: 430, z: -620, ry: 4, rx: -10, s: 1.4 },
};

/** Scène 2 (3-6 s) : la caméra plonge dans l'écran, l'interface s'échappe et flotte en 3D. */
export const Scene2Dive: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;

  // Plongée de la caméra vers l'écran
  const dive = (f: number) =>
    interpolate(f, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const d = dive(frame);
  const rest = restPose(absFrame - Math.max(0, frame), fps);
  const phoneScale = (f: number) => lerp(PHONE_SCALE, 2.6, dive(f));
  const sCur = phoneScale(frame);

  const phoneOpacity = interpolate(frame, [42, 78], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const phoneBlur = interpolate(frame, [30, 78], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [40, 62, 100], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Caméra du monde 3D : lente orbite + travelling avant continu
  const camRy = interpolate(frame, [40, 200], [7, -7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camZ = interpolate(frame, [40, 200], [-60, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Mise au point : glisse vers la carte « record » (qui sera la vedette de la scène 3)
  const focusZ = interpolate(frame, [60, 150], [-200, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.inOut,
  });

  const elementState = (i: number, f: number) => {
    const it = HOME_ITEMS[i];
    const tg = TARGETS[it.key];
    const p = spring({ frame: f - 44 - i * 2.5, fps, config: { damping: 20, stiffness: 46, mass: 1.1 } });
    const s0 = phoneScale(f);
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

  const elementsOpacity = interpolate(frame, [38, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Téléphone en plongée */}
      <AbsoluteFill
        style={{
          opacity: phoneOpacity,
          filter: phoneBlur > 0.3 ? `blur(${phoneBlur}px)` : undefined,
        }}
      >
        <AbsoluteFill style={{ perspective: 2200, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: `translate3d(0, ${lerp(rest.y, 0, d)}px, 0) rotateX(${lerp(rest.rx, 0, d)}deg) rotateY(${lerp(
                rest.ry,
                0,
                d,
              )}deg) rotateZ(${lerp(rest.rz, 0, d)}deg) scale(${sCur})`,
            }}
          >
            <Phone3D rotateY={lerp(rest.ry, 0, d)}>
              <HomeScreen />
            </Phone3D>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Éclair lumineux au passage de la vitre */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${accent.a(0.32 * flash)} 0%, transparent 70%)`,
        }}
      />

      {/* Éléments d'interface flottants */}
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
          {HOME_ITEMS.map((it, i) => {
            const st = elementState(i, frame);
            const prev = elementState(i, frame - 1);
            const speed = Math.hypot(st.x - prev.x, st.y - prev.y, st.z - prev.z);
            // Profondeur de champ (distance au plan de netteté) + flou de mouvement
            const dof = clamp(Math.abs(st.z + camZ - focusZ) / 55, 0, 14) * st.p;
            const blur = dof + clamp(speed * 0.06, 0, 6);
            const isRecord = it.key === "record";
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
                  boxShadow: isRecord ? `0 0 ${60 * st.p}px ${accent.a(0.45 * st.p)}` : undefined,
                  borderRadius: 22,
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
