import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { CONFIG } from "../config";
import { DirectionalBlur } from "../lib/motionBlur";
import { useScene } from "../lib/scene";
import { accent, clamp, ease, formatNumber, glow, textGlow } from "../lib/utils";
import { font, IconTrophy, ui } from "../ui/kit";
import { PROGRESS_POINTS } from "../ui/OtherScreens";

const CARD_W = 1120;
const CARD_H = 560;
const RADIUS = 48;
const TRAIL_PAD = 2;

/** Traînée de lumière néon qui parcourt le contour de la carte. */
const LightTrail: React.FC<{ offset: number; length: number; intensity: number }> = ({ offset, length, intensity }) => {
  const w = CARD_W + TRAIL_PAD * 2;
  const h = CARD_H + TRAIL_PAD * 2;
  const rect = { x: 0, y: 0, width: w, height: h, rx: RADIUS + TRAIL_PAD, pathLength: 1, fill: "none" } as const;
  const dash = `${length} ${1 - length}`;
  return (
    <svg
      width={w}
      height={h}
      style={{ position: "absolute", left: -TRAIL_PAD, top: -TRAIL_PAD, overflow: "visible", opacity: intensity }}
    >
      <defs>
        <filter id="trailBloom" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <filter id="trailSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      {/* Bloom large */}
      <rect {...rect} stroke={accent.base} strokeWidth={22} strokeDasharray={dash} strokeDashoffset={offset} filter="url(#trailBloom)" strokeLinecap="round" />
      {/* Halo moyen */}
      <rect {...rect} stroke={accent.light} strokeWidth={8} strokeDasharray={dash} strokeDashoffset={offset} filter="url(#trailSoft)" strokeLinecap="round" />
      {/* Cœur blanc, plus court (tête de comète) */}
      <rect
        {...rect}
        stroke="#ffffff"
        strokeWidth={3}
        strokeDasharray={`${length * 0.55} ${1 - length * 0.55}`}
        strokeDashoffset={offset - length * 0.45}
        strokeLinecap="round"
      />
    </svg>
  );
};

/** Mini graphique de progression qui se dessine. */
const Sparkline: React.FC<{ draw: number }> = ({ draw }) => {
  const w = 380;
  const h = 200;
  const min = Math.min(...PROGRESS_POINTS) - 3;
  const max = Math.max(...PROGRESS_POINTS) + 1;
  const pts = PROGRESS_POINTS.map((v, i) => [(i / (PROGRESS_POINTS.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const idx = Math.min(pts.length - 1, Math.floor(draw * (pts.length - 1)));
  const head = pts[idx];
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="spArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent.base} stopOpacity={0.35} />
          <stop offset="100%" stopColor={accent.base} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((g) => (
        <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.06)" />
      ))}
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#spArea)" opacity={draw} />
      <path
        d={d}
        fill="none"
        stroke={accent.light}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
        style={{ filter: `drop-shadow(0 0 8px ${accent.base}) drop-shadow(0 0 18px ${accent.a(0.6)})` }}
      />
      {draw > 0.02 ? (
        <circle cx={head[0]} cy={head[1]} r={9} fill="#fff" style={{ filter: `drop-shadow(0 0 10px ${accent.light})` }} />
      ) : null}
    </svg>
  );
};

/** Scène 3 (6-9 s) : la carte clé en grand, compteur qui s'incrémente, traînée lumineuse. */
export const Scene3Stat: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;
  const { stat } = CONFIG;

  const enter = spring({ frame: frame + 6, fps, config: { damping: 22, stiffness: 60, mass: 1 } });

  // Compteur : rapide au début, ralentit en douceur
  const value = (f: number) =>
    interpolate(f, [14, 118], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const v = value(frame);
  const dv = Math.abs(value(frame) - value(frame - 1));
  const digitBlur = clamp((dv / Math.max(1, stat.value)) * 260, 0, 7);
  const done = spring({ frame: frame - 118, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });

  const chartDraw = interpolate(frame, [24, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });

  // Traînée : fait le tour du contour en continu, en accélérant légèrement
  const trailOffset = -interpolate(frame, [-12, 192], [0.05, 1.85], { easing: ease.soft });
  const trailIntensity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Onde lumineuse au moment où le record est atteint
  const pulse = interpolate(frame, [118, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });

  const ry = -4 + Math.sin(t * 0.55) * 4;
  const rx = 6 * (1 - enter) + 4 + Math.sin(t * 0.7) * 1.2;
  const z = -500 * (1 - enter);
  const camScale = interpolate(frame, [0, 200], [1, 1.05]);

  return (
    <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
      {/* Lueur d'ambiance derrière la carte */}
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent.a(0.2 + 0.12 * done)} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          transformStyle: "preserve-3d",
          transform: `scale(${camScale}) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          opacity: enter,
        }}
      >
        {/* Onde de choc */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS,
            border: `2px solid ${accent.light}`,
            transform: `scale(${1 + pulse * 0.16})`,
            opacity: (1 - pulse) * (pulse > 0 ? 0.8 : 0),
            boxShadow: glow(accent.base, 1.2),
          }}
        />
        {/* Carte */}
        <div
          style={{
            ...font,
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS,
            overflow: "hidden",
            background: `linear-gradient(150deg, rgba(30,36,52,0.96) 0%, rgba(13,16,24,0.97) 60%, rgba(10,12,18,0.98) 100%)`,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `0 60px 120px rgba(0,0,0,0.6), 0 0 ${80 + 60 * done}px ${accent.a(0.25 + 0.15 * done)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
            display: "flex",
            padding: "64px 72px",
            boxSizing: "border-box",
          }}
        >
          {/* reflet interne */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(80% 90% at 10% 0%, ${accent.a(0.18)} 0%, transparent 60%)`,
            }}
          />
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: accent.a(0.22),
                  border: `1px solid ${accent.a(0.5)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: glow(accent.base, 0.6),
                }}
              >
                <IconTrophy size={30} color={accent.pale} />
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: accent.pale,
                  textShadow: textGlow(accent.base, 0.7),
                }}
              >
                {stat.label}
              </div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 600, color: ui.muted, marginTop: 34 }}>{stat.exercise}</div>
            <div style={{ position: "relative", height: 210, marginTop: 6 }}>
              <DirectionalBlur x={0} y={digitBlur}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 18,
                    fontSize: 196,
                    fontWeight: 800,
                    letterSpacing: -8,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    textShadow: textGlow(accent.base, 0.5 + 0.6 * done),
                  }}
                >
                  {formatNumber(v, stat.decimals)}
                  <span style={{ fontSize: 72, fontWeight: 700, color: accent.light, letterSpacing: -1 }}>{stat.unit}</span>
                </div>
              </DirectionalBlur>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 700,
                color: accent.pale,
                background: accent.a(0.16),
                border: `1px solid ${accent.a(0.4)}`,
                transform: `scale(${0.7 + 0.3 * done})`,
                transformOrigin: "left center",
                opacity: clamp(done * 1.4),
              }}
            >
              ▲ {stat.delta}
            </div>
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "flex-end", paddingBottom: 22 }}>
            <Sparkline draw={chartDraw} />
          </div>
        </div>
        <LightTrail offset={trailOffset} length={0.16} intensity={trailIntensity} />
        <LightTrail offset={trailOffset + 0.5} length={0.07} intensity={trailIntensity * 0.55} />
      </div>
    </AbsoluteFill>
  );
};
