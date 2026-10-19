import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, random, staticFile } from "remotion";
import { mix, rgba } from "../../lib/utils";
import { A, B } from "../../site/theme";
import { MOCKUP } from "../config";

/** Mur sombre, lampe chaude hors champ et bokeh flous (profondeur de champ). */
export const Wall: React.FC<{ t: number; screenLight: number }> = ({ t, screenLight }) => {
  const colors = [A.base, B.base, MOCKUP.lampColor, A.light, MOCKUP.lampColor, B.light, A.base, "#F472B6"];
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 60% 50% at 12% 0%, ${rgba(MOCKUP.lampColor, 0.16)} 0%, transparent 70%), radial-gradient(ellipse 70% 60% at 50% 38%, ${A.a(
          0.08 + 0.06 * screenLight,
        )} 0%, transparent 70%), linear-gradient(180deg, ${mix(MOCKUP.wall, "#ffffff", 0.03)} 0%, ${MOCKUP.wall} 70%)`,
      }}
    >
      {colors.map((c, i) => {
        const x = 80 + random(`bx${i}`) * 1760 + Math.sin(t * 0.25 + i) * 30;
        const y = 60 + random(`by${i}`) * 420 + Math.cos(t * 0.2 + i * 1.3) * 18;
        const r = 50 + random(`br${i}`) * 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${rgba(c, 0.35)} 0%, ${rgba(c, 0.18)} 55%, transparent 72%)`,
              filter: "blur(12px)",
              opacity: 0.55 + 0.45 * random(`bo${i}`),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const DW = 7000;
const DD = 5200;

/**
 * Plan du bureau, placé DANS le repère 3D du laptop (même transformation que lui).
 * yTop : hauteur du dessous de la base dans le repère du capot.
 */
export const DeskPlane: React.FC<{ lidW: number; yTop: number; screenLight: number; playing: boolean; videoFrame: number }> = ({
  lidW,
  yTop,
  screenLight,
  playing,
  videoFrame,
}) => {
  const halo = playing ? 0.18 + 0.12 * screenLight : 0.1;
  const haloColor = playing ? A.a(halo) : `rgba(200,200,220,${halo})`;
  const haloColor2 = playing ? B.a(halo * 0.6) : "rgba(0,0,0,0)";
  return (
    <div
      style={{
        position: "absolute",
        left: lidW / 2 - DW / 2,
        top: yTop - DD / 2,
        width: DW,
        height: DD,
        transformOrigin: "50% 50%",
        transform: "rotateX(90deg)",
        background: `radial-gradient(ellipse 1500px 1100px at 50% ${DD / 2 + 700}px, ${haloColor} 0%, transparent 70%), radial-gradient(ellipse 900px 700px at 62% ${
          DD / 2 + 900
        }px, ${haloColor2} 0%, transparent 70%), linear-gradient(180deg, rgba(0,0,0,0) 0%, ${MOCKUP.desk[1]} 30%, ${MOCKUP.desk[0]} 55%, ${MOCKUP.desk[1]} 85%)`,
        overflow: "hidden",
      }}
    >
      {/* grain de matière étiré horizontalement */}
      {/* calculé à 1/10 de la taille puis agrandi : beaucoup plus rapide au rendu */}
      <svg
        width={DW / 10}
        height={DD / 10}
        style={{ position: "absolute", left: 0, top: 0, opacity: 0.06, transform: "scale(10)", transformOrigin: "0 0" }}
      >
        <filter id="deskGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.6" numOctaves={2} seed={3} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={DW / 10} height={DD / 10} filter="url(#deskGrain)" />
      </svg>
      {/* reflet flou de l'écran, devant le laptop */}
      <div
        style={{
          position: "absolute",
          left: DW / 2 - 640,
          top: DD / 2 + 980,
          width: 320,
          height: 180,
          transform: "scale(4, -4)",
          transformOrigin: "0 0",
          marginTop: 720,
          opacity: 0.08,
          filter: "blur(8px)",
        }}
      >
        {/* image réduite (1/4) puis agrandie : le reflet est très flou de toute façon */}
        <Freeze frame={videoFrame}>
          <OffthreadVideo src={staticFile(MOCKUP.video)} muted style={{ width: 320, height: 180 }} />
        </Freeze>
      </div>
    </div>
  );
};

/** Tasse et carnet, hors de la zone de netteté (flous). */
export const Mug: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <div style={{ position: "absolute", left: x - 90 * k, top: y - 200 * k, width: 180 * k, height: 210 * k, filter: "blur(9px)" }}>
    <svg viewBox="0 0 180 210" width="100%" height="100%">
      <defs>
        <linearGradient id="mugG" x1="0" x2="1">
          <stop offset="0%" stopColor="#2a2633" />
          <stop offset="40%" stopColor="#5a5466" />
          <stop offset="100%" stopColor="#1d1a24" />
        </linearGradient>
      </defs>
      <path d="M134 70 C176 70 176 140 134 140" stroke="#3a3544" strokeWidth={16} fill="none" />
      <path d="M20 40 L140 40 L132 196 C132 204 28 204 28 196 Z" fill="url(#mugG)" />
      <ellipse cx={80} cy={40} rx={60} ry={12} fill="#141118" />
      <ellipse cx={80} cy={40} rx={60} ry={12} fill="none" stroke="#6c6578" strokeWidth={3} />
    </svg>
  </div>
);

export const Notebook: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <div style={{ position: "absolute", left: x - 260 * k, top: y - 90 * k, width: 520 * k, height: 180 * k, filter: "blur(10px)" }}>
    <svg viewBox="0 0 520 180" width="100%" height="100%">
      <path d="M60 20 L480 34 L500 150 L30 160 Z" fill="#26222e" />
      <path d="M60 20 L480 34 L486 60 L56 48 Z" fill="#3a3445" />
      <path d="M380 28 L392 28 L410 156 L398 156 Z" fill={A.base} opacity={0.6} />
    </svg>
  </div>
);
