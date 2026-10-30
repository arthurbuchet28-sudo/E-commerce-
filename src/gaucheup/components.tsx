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

/** Textures disponibles (« love » = rouge-blanc-vert, gardée en réserve). */
export type Texture = "original" | "chrome" | "leopard" | "holo" | "fire" | "rose" | "love" | "ocean";

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
/** Texture « océan » : eau profonde, reflets de lumière qui ondulent (caustiques), bulles et surface brillante. */
const OceanLogo: React.FC<{ width: number; t: number }> = ({ width, t }) => {
  const h = (width * 730) / 1053;
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${asset("logo-mask.png")})`,
    maskImage: `url(${asset("logo-mask.png")})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.cream,
          WebkitMaskImage: `url(${asset("logo-outline.png")})`,
          maskImage: `url(${asset("logo-outline.png")})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.35))",
        }}
      />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...mask }}>
        {/* profondeur : turquoise en surface, bleu abyssal en bas */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(175deg, #8EF0F5 0%, #2EC4DD 24%, #1186C2 52%, #0A4F97 78%, #062A5E 100%)" }} />
        {/* caustiques : bandes de lumière qui ondulent */}
        <svg width={width} height={h} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
          <defs>
            <filter id="guCaustics" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves={2} seed={4} />
              <feComponentTransfer>
                <feFuncR type="table" tableValues="0 0 0 0.2 1 0.2 0 0 0 0.15 0.9 0.1 0" />
                <feFuncG type="table" tableValues="0 0 0 0.2 1 0.2 0 0 0 0.15 0.9 0.1 0" />
                <feFuncB type="table" tableValues="0 0 0 0.2 1 0.2 0 0 0 0.15 0.9 0.1 0" />
                <feFuncA type="table" tableValues="1 1" />
              </feComponentTransfer>
              <feGaussianBlur stdDeviation={1.2} />
            </filter>
          </defs>
          <g transform={`translate(${-200 + Math.sin(t * 0.9) * 60 + t * 40} ${-150 + Math.cos(t * 0.7) * 40 + t * 22})`} opacity={0.8}>
            <rect width={width + 600} height={h + 500} filter="url(#guCaustics)" />
          </g>
        </svg>
        {/* bulles qui montent */}
        {Array.from({ length: 14 }).map((_, i) => {
          const r = 5 + random(`ob${i}`) * 12;
          const speed = 60 + random(`os${i}`) * 90;
          const y = h - (((t * speed + random(`oy${i}`) * h) % (h + 40)) - 20);
          const x = random(`ox${i}`) * width + Math.sin(t * 2.5 + i) * 8;
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
                border: "2px solid rgba(255,255,255,0.7)",
                background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 70%)",
              }}
            />
          );
        })}
        {/* surface : reflet brillant + ombre au fond */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.18) 22%, rgba(255,255,255,0) 40%, rgba(0,10,40,0.35) 100%)" }} />
        <div
          style={{
            position: "absolute",
            left: `${-30 + ((t * 18) % 160)}%`,
            top: 0,
            bottom: 0,
            width: "22%",
            background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)",
            transform: "skewX(-18deg)",
          }}
        />
      </div>
    </div>
  );
};

export const GULogo: React.FC<{ texture: Texture; width: number; height: number; t?: number }> = ({ texture, width, height, t = 0 }) => {
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
    case "ocean":
      return (
        <div style={box}>
          <OceanLogo width={width * 0.9} t={t} />
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
