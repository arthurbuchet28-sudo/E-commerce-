import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile } from "remotion";
import { DirectionalBlur } from "../lib/motionBlur";
import { ease } from "../lib/utils";
import { GU } from "./config";

export const W = GU.width;
export const H = GU.height;
const C = GU.colors;
export const asset = (p: string) => staticFile(`gaucheup/${p}`);
export const tee = (name: string) => asset(`tees/${name}.jpg`);

/* ───────────── Logo aux textures interchangeables ───────────── */

export type Texture = (typeof GU.logoTextures)[number];

/** Rendu à partir de la forme exacte des lettres du logo (extraite du logo officiel). */
const MaskLogo: React.FC<{ width: number; fill: string; outline: string; gloss?: boolean; extra?: React.ReactNode }> = ({ width, fill, outline, gloss, extra }) => {
  const h = (width * 730) / 1053;
  const mask = (url: string): React.CSSProperties => ({
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  });
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: outline, ...mask(asset("logo-outline.png")), filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.35))" }} />
      <div style={{ position: "absolute", inset: 0, background: fill, ...mask(asset("logo-mask.png")) }} />
      {gloss ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(170deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.15) 28%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.18) 100%)",
            mixBlendMode: "screen",
            ...mask(asset("logo-mask.png")),
          }}
        />
      ) : null}
      {extra}
    </div>
  );
};

/** Logo Gauche'Up dans une texture donnée, centré dans une boîte width × height. */
export const GULogo: React.FC<{ texture: Texture; width: number; height: number }> = ({ texture, width, height }) => {
  const box: React.CSSProperties = { width, height, display: "flex", alignItems: "center", justifyContent: "center" };
  const img = (file: string, scale = 1) => (
    <div style={box}>
      <Img src={asset(file)} style={{ maxWidth: width * scale, maxHeight: height * scale, objectFit: "contain", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.35))" }} />
    </div>
  );
  switch (texture) {
    case "chrome":
      return img("logo-chrome.png", 0.88);
    case "leopard":
      return img("logo-leopard.png", 0.92);
    case "holo":
      return img("logo-holo.png", 0.9);
    case "fire":
      return img("logo-fire.png", 0.98);
    case "rose":
      return (
        <div style={box}>
          <MaskLogo width={width * 0.9} fill="radial-gradient(120% 90% at 35% 20%, #FFD3E4 0%, #FF8DB8 38%, #F2528E 75%, #C42D69 100%)" outline={C.cream} gloss />
        </div>
      );
    case "love":
      return (
        <div style={box}>
          <MaskLogo width={width * 0.9} fill={`linear-gradient(100deg, ${C.red} 0 34%, ${C.cream} 34% 66%, ${C.green} 66% 100%)`} outline={C.ink} gloss />
        </div>
      );
    default:
      // le vrai logo : lettres noires, contour crème façon sticker
      return (
        <div style={box}>
          <MaskLogo width={width * 0.9} fill={C.ink} outline={C.cream} />
        </div>
      );
  }
};

/* ───────────── Motif de fond : les formes des lettres, en géant (comme sur le site) ───────────── */

export const Swirls: React.FC<{ frame: number; color: string; opacity?: number }> = ({ frame, color, opacity = 1 }) => {
  const spots = [
    { x: -260, y: -120, s: 2.4, r: -18 },
    { x: 420, y: 260, s: 2.1, r: 24 },
    { x: -340, y: 980, s: 2.6, r: 12 },
    { x: 380, y: 1320, s: 2.2, r: -30 },
  ];
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      {spots.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x + Math.sin(frame / 90 + i) * 30,
            top: p.y + Math.cos(frame / 110 + i * 2) * 26,
            width: 1053 * 0.9 * p.s,
            height: 730 * 0.9 * p.s,
            transform: `rotate(${p.r + Math.sin(frame / 140 + i) * 3}deg)`,
            background: color,
            WebkitMaskImage: `url(${asset("logo-mask.png")})`,
            maskImage: `url(${asset("logo-mask.png")})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────── Transition « poussée vers la gauche » ───────────── */

/** Durée du raccord (frames) : il est centré sur la coupe, de -HALF à +HALF. */
export const HALF = 7;

/**
 * Position horizontale d'une scène : elle arrive par la droite et repart par la gauche.
 * Tout part à gauche : c'est la ligne éditoriale de la marque.
 */
export const pushX = (frame: number, dur: number, first: boolean, last: boolean) => {
  const pIn = first ? 1 : interpolate(frame, [-HALF, HALF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const pOut = last ? 0 : interpolate(frame, [dur - HALF, dur + HALF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  return { x: W * (1 - pIn) - W * pOut, tilt: -3 * Math.sin(Math.PI * (1 - pIn)) - 3 * Math.sin(Math.PI * pOut) };
};

export const Pushed: React.FC<{ frame: number; dur: number; first?: boolean; last?: boolean; children: React.ReactNode }> = ({ frame, dur, first = false, last = false, children }) => {
  const a = pushX(frame, dur, first, last);
  const b = pushX(frame - 1, dur, first, last);
  const v = Math.abs(a.x - b.x);
  return (
    <DirectionalBlur x={Math.min(40, v * 0.28)} y={0}>
      <AbsoluteFill style={{ transform: `translateX(${a.x}px) rotate(${a.tilt}deg)` }}>{children}</AbsoluteFill>
    </DirectionalBlur>
  );
};

/* ───────────── Étincelles 4 branches ───────────── */

export const Sparkle: React.FC<{ x: number; y: number; size: number; t: number; color?: string }> = ({ x, y, size, t, color = "#fff" }) => {
  if (t <= 0 || t >= 1) return null;
  const s = size * Math.sin(Math.PI * t);
  return (
    <svg width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x - s, top: y - s, overflow: "visible", transform: `rotate(${t * 45}deg)` }}>
      <path d="M0 -1 Q0.12 -0.12 1 0 Q0.12 0.12 0 1 Q-0.12 0.12 -1 0 Q-0.12 -0.12 0 -1 Z" fill={color} style={{ filter: `drop-shadow(0 0 0.15px ${color})` }} />
    </svg>
  );
};

/** Gerbe d'étincelles autour d'un point (pour les « pops » de texture). */
export const SparkBurst: React.FC<{ age: number; cx: number; cy: number; seed: string; spread?: number }> = ({ age, cx, cy, seed, spread = 420 }) => (
  <>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = random(`${seed}a${i}`) * Math.PI * 2;
      const r = spread * (0.55 + random(`${seed}r${i}`) * 0.45);
      const t = (age - random(`${seed}d${i}`) * 6) / 22;
      return <Sparkle key={i} x={cx + Math.cos(a) * r} y={cy + Math.sin(a) * r * 0.75} size={22 + random(`${seed}s${i}`) * 26} t={t} />;
    })}
  </>
);
