import React from "react";
import { AbsoluteFill, interpolate, random, spring, useVideoConfig } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp } from "../../lib/utils";
import { LightTrail } from "../../site/components/LightTrail";
import { VICAT } from "../config";
import { GlowCard, IconTile } from "../components/GlowCard";
import { PictoBatiment } from "../components/Pictos";
import { Wipe } from "../components/Reveal";
import { A, G, blueBright, trail, ui, vfont } from "../theme";

const CARD_W = 1240;
const CARD_H = 430;
/** Moment où le sous-titre cède la place aux 3 gammes (jamais plus de 2 lignes à l'écran). */
const SWAP = 118;
/** Décalage d'apparition entre deux gammes (la musique joue une note sur chacune). */
const STAGGER = 12;

const TILE_W = 460;
const TILE_H = 190;
const TILE_GAP = 40;
/** Position finale de la carte (remontée) et des tuiles, en px depuis le centre. */
const CARD_UP = -205;
const TILES_Y = 255;

/** Échantillon de matière pour chaque gamme : béton lisse, terrazzo décoratif, béton fibré technique. */
const Swatch: React.FC<{ kind: number; size: number }> = ({ kind, size }) => {
  const id = `sw${kind}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", flexShrink: 0, borderRadius: size * 0.28 }}>
      <defs>
        <filter id={`${id}n`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={kind + 2} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={0.35} />
          </feComponentTransfer>
        </filter>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={kind === 2 ? "#5E7FA3" : "#C9C5BD"} />
          <stop offset="1" stopColor={kind === 2 ? A.base : "#9E9A92"} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}g)`} />
      {kind === 1
        ? // terrazzo : éclats de granulats bleus et gris
          Array.from({ length: 34 }).map((_, i) => (
            <ellipse
              key={i}
              cx={random(`tx${i}`) * 100}
              cy={random(`ty${i}`) * 100}
              rx={2 + random(`tr${i}`) * 5}
              ry={1.5 + random(`tq${i}`) * 3.5}
              transform={`rotate(${random(`ta${i}`) * 180} ${random(`tx${i}`) * 100} ${random(`ty${i}`) * 100})`}
              fill={[A.base, blueBright, "#F4F3EF", G.deep][i % 4]}
              opacity={0.9}
            />
          ))
        : null}
      {kind === 2
        ? // fibres : traits fins entrecroisés
          Array.from({ length: 22 }).map((_, i) => {
            const x = random(`fx${i}`) * 100;
            const y = random(`fy${i}`) * 100;
            const a = random(`fa${i}`) * Math.PI;
            return (
              <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 18} y2={y + Math.sin(a) * 18} stroke="#E8EEF5" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
            );
          })
        : null}
      <rect width="100" height="100" filter={`url(#${id}n)`} />
      <rect x="1" y="1" width="98" height="98" rx="27" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
    </svg>
  );
};

/**
 * Scène 3 (6,5-10,5 s) : la carte « béton prêt à l'emploi » arrive seule ;
 * puis elle remonte et les 3 gammes jaillissent en tuiles séparées, en éventail 3D,
 * reliées à la carte par des lignes de lumière.
 */
export const Scene3Offer: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const { height: H } = useVideoConfig();
  const t = absFrame / fps;
  const { offer } = VICAT;

  const sub = interpolate(frame, [32, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const subOut = interpolate(frame, [SWAP - 14, SWAP + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.in });
  const tile = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 120 } });

  // La carte remonte et rétrécit pour laisser la place aux gammes
  const lift = spring({ frame: frame - (SWAP - 16), fps, config: { damping: 20, stiffness: 70 } });
  const cardY = lerp(0, CARD_UP, lift);
  const cardS = lerp(1, 0.8, lift);
  // …et perd la hauteur du sous-titre parti, pour ne pas rester creuse
  const cardH = lerp(CARD_H, CARD_H - 96, lift);
  const cardBottom = H / 2 + cardY + (cardH * cardS) / 2;

  const xs = [-1, 0, 1].map((k) => k * (TILE_W + TILE_GAP));
  const tilesTop = H / 2 + TILES_Y - TILE_H / 2;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Carte titre */}
      <div style={{ transform: `translateY(${cardY}px) scale(${cardS})` }}>
        <GlowCard frame={frame} t={t} fps={fps} width={CARD_W} height={cardH}>
          <div style={{ position: "relative", height: "100%", padding: "64px 84px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ transform: `scale(${tile})`, transformOrigin: "left center" }}>
              <IconTile size={92}>
                <PictoBatiment size={56} color={A.base} stroke={1.5} draw={clamp(tile)} />
              </IconTile>
            </div>
            <div style={{ marginTop: 44, fontSize: 90, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, whiteSpace: "nowrap", ...Wipe(frame, 8, 40) }}>
              {offer.title}
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 54,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: ui.muted,
                whiteSpace: "nowrap",
                opacity: sub * (1 - subOut),
                transform: `translateY(${(1 - sub) * 20 - subOut * 24}px)`,
                filter: subOut > 0.01 ? `blur(${subOut * 10}px)` : undefined,
              }}
            >
              {offer.subtitle}
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Lignes de lumière : de la carte vers chaque gamme */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="offerBloom" x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation={6} />
          </filter>
        </defs>
        {xs.map((x, i) => {
          const dr = interpolate(frame, [SWAP - 4 + i * STAGGER, SWAP + 22 + i * STAGGER], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease.out,
          });
          if (dr <= 0) return null;
          const cx = 960;
          const a = { x: cx + x * 0.35, y: cardBottom - 6 };
          const b = { x: cx + x, y: tilesTop + 4 };
          const midY = (a.y + b.y) / 2;
          const d = `M${a.x} ${a.y} C${a.x} ${midY} ${b.x} ${midY} ${b.x} ${b.y}`;
          const flow = -(frame / 50 + i * 0.3);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={blueBright} strokeWidth={8} filter="url(#offerBloom)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} opacity={0.45} />
              <path d={d} fill="none" stroke={A.base} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} />
              <path d={d} fill="none" stroke={trail.core} strokeWidth={3} pathLength={1} strokeDasharray="0.08 0.4" strokeDashoffset={flow} opacity={dr} strokeLinecap="round" />
              <circle cx={b.x} cy={b.y} r={6 * dr} fill={A.base} />
            </g>
          );
        })}
      </svg>

      {/* Gammes : tuiles séparées en éventail 3D */}
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", perspective: 1600, perspectiveOrigin: "50% 40%" }}>
        {offer.ranges.map((r, i) => {
          const at = SWAP + i * STAGGER;
          const m = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 90 } });
          const bob = Math.sin(t * 1.4 + i * 1.3) * 6;
          const fan = (i - 1) * 14;
          const trailOffset = -interpolate(frame, [at, at + 90], [0.1, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.soft });
          const trailOn = interpolate(frame, [at, at + 10, at + 70, at + 95], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={r}
              style={{
                ...vfont,
                position: "absolute",
                left: 960 + xs[i] - TILE_W / 2,
                top: tilesTop + bob,
                width: TILE_W,
                height: TILE_H,
                transformStyle: "preserve-3d",
                transform: `translateY(${(1 - m) * 120}px) translateZ(${-500 * (1 - m) + (i === 1 ? 30 : 0)}px) rotateY(${-fan}deg) rotateX(${(1 - m) * 25 + 6}deg)`,
                opacity: clamp(m * 1.6),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 36,
                  background: ui.card,
                  border: `1px solid ${ui.border}`,
                  boxShadow: `${ui.shadow}, 0 0 50px ${A.a(0.1)}, inset 0 1px 0 #fff`,
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  padding: "0 32px",
                  boxSizing: "border-box",
                }}
              >
                <Swatch kind={i} size={104} />
                <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{r}</div>
              </div>
              <LightTrail width={TILE_W} height={TILE_H} radius={36} offset={trailOffset} length={0.22} intensity={trailOn} {...trail} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
