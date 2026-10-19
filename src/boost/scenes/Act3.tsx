import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { DirectionalBlur } from "../../lib/motionBlur";
import { useScene } from "../../lib/scene";
import { clamp, ease, glow, lerp } from "../../lib/utils";
import { BOOST, beats } from "../config";
import { BoostLogo } from "../components/BoostLogo";
import { Flash, shake } from "../components/fx";
import { Kinetic } from "../components/Kinetic";
import { Thread } from "../components/Thread";
import { O, Y, bfont, flame, ui } from "../theme";
import { Arrow } from "../ui/icons";

const W = 1080;
const H = 1920;
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const glass: React.CSSProperties = {
  boxSizing: "border-box",
  borderRadius: 30,
  background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
  backgroundColor: ui.cardSolid,
  border: `1px solid ${ui.border}`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 60px rgba(0,0,0,0.45)",
};

/* ───────────────────────── Maquettes des fonctionnalités ───────────────────────── */

const BarsMock: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const vals = [0.32, 0.45, 0.38, 0.55, 0.5, 0.7, 1];
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <div style={{ position: "absolute", inset: "40px 40px 30px", display: "flex", alignItems: "flex-end", gap: 22 }}>
      {vals.map((v, i) => {
        const p = spring({ frame: f - 4 - i * 3, fps, config: { damping: 15, stiffness: 120 } });
        const last = i === vals.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, height: "100%", justifyContent: "flex-end" }}>
            {last ? (
              <div style={{ ...bfont, fontWeight: 800, fontSize: 28, color: Y.base, whiteSpace: "nowrap", opacity: clamp((p - 0.6) * 3) }}>+340 %</div>
            ) : null}
            <div
              style={{
                width: "100%",
                height: `${v * 74 * p}%`,
                borderRadius: 14,
                background: last ? flame(180) : "rgba(255,255,255,0.14)",
                boxShadow: last ? glow(O.base, 0.8) : undefined,
              }}
            />
            <div style={{ ...bfont, fontSize: 24, color: ui.muted }}>{days[i]}</div>
          </div>
        );
      })}
    </div>
  );
};

const BubblesMock: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const spots = [
    { x: 0.5, y: 0.42, r: 150 },
    { x: 0.2, y: 0.25, r: 90 },
    { x: 0.82, y: 0.24, r: 84 },
    { x: 0.18, y: 0.74, r: 96 },
    { x: 0.8, y: 0.72, r: 104 },
    { x: 0.52, y: 0.86, r: 70 },
  ];
  return (
    <div style={{ position: "absolute", inset: 20 }}>
      {spots.map((s, i) => {
        const p = spring({ frame: f - 4 - i * 3, fps, config: { damping: 11, stiffness: 140 } });
        const big = i === 0;
        return (
          <div
            key={i}
            style={{
              ...bfont,
              position: "absolute",
              left: `calc(${s.x * 100}% - ${s.r}px)`,
              top: `calc(${s.y * 100}% - ${s.r}px)`,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: "50%",
              background: big ? flame() : "rgba(255,255,255,0.07)",
              border: big ? "none" : `1px solid ${ui.border}`,
              boxShadow: big ? glow(O.base, 1) : undefined,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${p})`,
              fontWeight: 800,
              fontSize: big ? 36 : 24,
              color: big ? "#1a0d06" : ui.text,
            }}
          >
            {BOOST.hashtags[i]}
            {big ? <div style={{ fontSize: 22, marginTop: 6 }}>en hausse</div> : null}
          </div>
        );
      })}
    </div>
  );
};

const CalendarMock: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const lit = [
    { i: 9, label: "19:12" },
    { i: 16, label: "12:30" },
    { i: 25, label: "18:45" },
  ];
  return (
    <div style={{ position: "absolute", inset: "34px 34px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>
      {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
        <div key={"d" + i} style={{ ...bfont, textAlign: "center", fontSize: 22, color: ui.muted }}>
          {d}
        </div>
      ))}
      {Array.from({ length: 28 }).map((_, i) => {
        const l = lit.findIndex((x) => x.i === i);
        const p = l >= 0 ? spring({ frame: f - 8 - l * beats(0.5), fps, config: { damping: 12, stiffness: 150 } }) : 0;
        return (
          <div
            key={i}
            style={{
              ...bfont,
              height: 104,
              borderRadius: 16,
              background: l >= 0 ? `rgba(255,107,53,${0.12 + 0.88 * p})` : "rgba(255,255,255,0.05)",
              boxShadow: l >= 0 && p > 0.1 ? glow(O.base, 0.6 * p) : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
              color: "#1a0d06",
              transform: `scale(${1 + 0.12 * p * (1 - p) * 4})`,
            }}
          >
            {l >= 0 && p > 0.3 ? lit[l].label : ""}
          </div>
        );
      })}
    </div>
  );
};

/** Un écran de fonctionnalité : un grand mot, une phrase, une mini-maquette. */
export const FeaturePanel: React.FC<{ i: number; f: number; fps: number }> = ({ i, f: f0, fps }) => {
  // le contenu commence à pousser pendant le whip, pour arriver « vivant »
  const f = f0 + 8;
  const feat = BOOST.features[i];
  const sub = spring({ frame: f - 6, fps, config: { damping: 18, stiffness: 120 } });
  const Mock = [BarsMock, BubblesMock, CalendarMock][i];
  return (
    <AbsoluteFill>
      <div style={{ ...bfont, position: "absolute", top: 330, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: i === 2 ? 126 : 150,
            letterSpacing: "-0.05em",
            background: `linear-gradient(90deg, ${Y.base}, ${O.base})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 0 30px ${O.a(0.4)})`,
          }}
        >
          {feat.word}
        </div>
        <div style={{ fontSize: 46, color: ui.text, marginTop: 10, opacity: clamp(sub * 1.4), transform: `translateY(${(1 - sub) * 24}px)` }}>{feat.sub}</div>
      </div>
      <div style={{ ...glass, position: "absolute", left: 140, top: 700, width: 800, height: 620 }}>
        <Mock f={f} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

/** Traînées de lumière horizontales qui accompagnent un whip pan (intensité 0 → 1 → 0). */
export const WhipStreaks: React.FC<{ k: number; seed: string }> = ({ k, seed }) => {
  if (k <= 0.02) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const y = 200 + random(`${seed}y${i}`) * 1500;
        const len = 300 + random(`${seed}l${i}`) * 700;
        const x = random(`${seed}x${i}`) * (W + len) - len;
        return (
          <line
            key={i}
            x1={x}
            x2={x + len * k}
            y1={y}
            y2={y}
            stroke={i % 3 ? O.light : Y.pale}
            strokeWidth={1.5 + random(`${seed}w${i}`) * 3}
            strokeLinecap="round"
            opacity={k * (0.25 + 0.5 * random(`${seed}o${i}`))}
            style={{ filter: `drop-shadow(0 0 6px ${O.base})` }}
          />
        );
      })}
    </svg>
  );
};

/** Progression d'un whip pan (rapide au milieu) sur les `len` dernières frames avant `end`. */
export const whipP = (f: number, end: number, len = 10) =>
  interpolate(f, [end - len, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });

/* ───────────────────────── Scène 6 — Fonctionnalités (14-18 s) ───────────────────────── */

/** Fenêtres des panneaux (en temps) : chaque raccord est un whip pan sur le temps. */
const PANELS = [
  [0, 3],
  [3, 6],
  [6, 8],
];

export const S6Features: React.FC = () => {
  const { frame, fps } = useScene();
  // les panneaux sont côte à côte (comme un travelling) : pendant le whip, le sortant et l'entrant bougent ensemble
  const xAt = (i: number, f: number) => {
    const s = beats(PANELS[i][0]);
    const e = beats(PANELS[i][1]);
    const inP = i === 0 ? 1 : whipP(f, s);
    const outP = i < PANELS.length - 1 ? whipP(f, e) : 0;
    const since = f - s;
    const settle = since > 0 ? Math.sin(since / 3) * 22 * Math.exp(-since / 5) : 0;
    return W * (1 - inP) - W * outP + settle;
  };
  const streak = Math.max(...PANELS.slice(0, -1).map(([, b]) => Math.sin(whipP(frame, beats(b)) * Math.PI)));
  return (
    <AbsoluteFill>
      {PANELS.map(([a, b], i) => {
        const s = beats(a);
        const e = beats(b);
        if ((i > 0 && frame < s - 10) || (i < PANELS.length - 1 && frame > e)) return null;
        const x = xAt(i, frame);
        const v = Math.abs(x - xAt(i, frame - 1));
        return (
          <DirectionalBlur key={i} x={clamp(v * 0.3, 0, 40)} y={0}>
            <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
              <FeaturePanel i={i} f={frame - s} fps={fps} />
            </AbsoluteFill>
          </DirectionalBlur>
        );
      })}
      <WhipStreaks k={streak} seed="s6" />
    </AbsoluteFill>
  );
};

/* ───────────────────────── Scène 7 — Appel à l'action (18-22 s) ───────────────────────── */

const NAME_SIZE = 150;
const LOGO_SIZE = 300;
const LOGO_Y = 720;

export const S7CTA: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;
  const sk = shake(frame, beats(2), 5);
  // convergence du dernier panneau + traînées
  const conv = interpolate(frame, [0, beats(1)], [0, 1], { ...clampOpt, easing: ease.in });
  const core = interpolate(frame, [beats(0.8), beats(1), beats(1.5), beats(2)], [0, 1, 0.15, 0.5], clampOpt);
  // le fil orange entre et dessine le logo (19 s = 2e temps de la scène… 2 temps après le début)
  const lead = interpolate(frame, [beats(1.4), beats(2)], [0, 1], { ...clampOpt, easing: ease.inOut });
  const draw = interpolate(frame, [beats(2), beats(3.3)], [0, 1], { ...clampOpt, easing: ease.inOut });
  const fill = interpolate(frame, [beats(3), beats(3.7)], [0, 1], { ...clampOpt, easing: ease.out });
  const nameP = interpolate(frame, [beats(4), beats(4.9)], [0, 1], { ...clampOpt, easing: ease.out });
  const pop = spring({ frame: frame - beats(6), fps, config: { damping: 10, stiffness: 150, mass: 0.7 } });
  const shimmer = interpolate(frame, [beats(6.8), beats(7.8)], [-40, 140], { ...clampOpt, easing: ease.inOut });
  const urlIn = interpolate(frame, [beats(6.5), beats(7.2)], [0, 1], clampOpt);
  const breathe = 1 + Math.sin(t * 2.2) * 0.012 * fill;
  const nameW = useMemo(() => {
    if (typeof document === "undefined") return NAME_SIZE * 0.6 * BOOST.siteName.length;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return NAME_SIZE * 0.6 * BOOST.siteName.length;
    ctx.font = `800 ${NAME_SIZE}px ${BOOST.fontFamily}`;
    return ctx.measureText(BOOST.siteName).width - NAME_SIZE * 0.045 * BOOST.siteName.length;
  }, []);
  const logoLeft = 540 - LOGO_SIZE / 2;

  return (
    <AbsoluteFill style={{ transform: `translate(${sk.x}px, ${sk.y}px)` }}>
      {/* dernier panneau qui converge vers le centre */}
      {conv < 1 ? (
        <AbsoluteFill style={{ transform: `scale(${lerp(1, 0.04, conv)})`, opacity: 1 - conv * 0.6, filter: conv > 0.05 ? `blur(${(conv * 16).toFixed(1)}px)` : undefined }}>
          <FeaturePanel i={2} f={frame + beats(2)} fps={fps} />
        </AbsoluteFill>
      ) : null}
      {/* traînées convergentes */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 70 }).map((_, i) => {
          const delay = random(`cd${i}`) * 14;
          const pAt = (f: number) => interpolate(f, [delay - 4, beats(1) + delay * 0.4], [0, 1], { ...clampOpt, easing: ease.in });
          const p = pAt(frame);
          if (p <= 0 || p >= 1) return null;
          const a = random(`ca${i}`) * Math.PI * 2;
          const r0 = 800 + random(`cr${i}`) * 700;
          const r1 = r0 * (1 - p);
          const r2 = r0 * (1 - pAt(frame - 3));
          return (
            <line
              key={i}
              x1={540 + Math.cos(a) * r1}
              y1={LOGO_Y + Math.sin(a) * r1}
              x2={540 + Math.cos(a) * r2}
              y2={LOGO_Y + Math.sin(a) * r2}
              stroke={i % 3 ? O.light : Y.pale}
              strokeWidth={2 + random(`cw${i}`) * 3}
              strokeLinecap="round"
              opacity={Math.sin(p * Math.PI)}
              style={{ filter: `drop-shadow(0 0 6px ${O.base})` }}
            />
          );
        })}
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(LOGO_Y / H) * 100}%, rgba(255,255,255,${0.45 * core}) 0%, ${O.a(0.4 * core)} 7%, ${O.a(0.1 * core)} 22%, transparent 42%)` }} />

      {/* le fil orange arrive de la gauche jusqu'au départ du tracé du logo */}
      <Thread
        d={`M-40 1000 C220 1000 300 ${LOGO_Y} ${logoLeft + 27} ${LOGO_Y - LOGO_SIZE / 2 + 93}`}
        width={W}
        height={H}
        draw={lead}
        heat={1}
        style={{ opacity: 1 - interpolate(frame, [beats(2.6), beats(3.4)], [0, 1], clampOpt) }}
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, transform: `scale(${breathe})` }}>
        <div style={{ position: "absolute", left: logoLeft, top: LOGO_Y - LOGO_SIZE / 2, filter: `drop-shadow(0 0 ${40 * fill}px ${O.a(0.55 * fill)})` }}>
          <BoostLogo size={LOGO_SIZE} draw={draw} fill={fill} />
        </div>
        {/* nom */}
        <div
          style={{
            ...bfont,
            position: "absolute",
            left: 540 - nameW / 2 - 20,
            top: 920,
            width: nameW + 40,
            clipPath: `inset(-40px ${(1 - nameP) * 100}% -40px 0)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: NAME_SIZE,
              letterSpacing: "-0.045em",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              transform: `translateX(${(1 - nameP) * -50}px)`,
              filter: `${nameP < 1 ? `blur(${((1 - nameP) * 10).toFixed(2)}px) ` : ""}drop-shadow(0 0 26px ${O.a(0.35)})`,
              background: `linear-gradient(180deg, #ffffff 35%, ${Y.pale} 120%)`,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {BOOST.siteName}
          </div>
        </div>
        {/* slogan */}
        <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic
            words={[{ w: BOOST.tagline.split(" ")[0] }, { w: BOOST.tagline.split(" ").slice(1).join(" "), key: true }]}
            frame={frame}
            start={beats(5)}
            stagger={beats(0.5)}
            fps={fps}
            size={64}
          />
        </div>
        {/* bouton */}
        <div style={{ position: "absolute", top: 1240, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              ...bfont,
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "30px 60px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 44,
              color: "#1a0d06",
              background: flame(100),
              boxShadow: `${glow(O.base, 1.1 * pop)}, inset 0 1px 0 rgba(255,255,255,0.5)`,
              transform: `scale(${Math.max(0, pop)})`,
              opacity: clamp(pop * 3),
              overflow: "hidden",
            }}
          >
            {BOOST.ctaLabel}
            <Arrow size={44} color="#1a0d06" />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shimmer}%`, width: "30%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)", transform: "skewX(-20deg)" }} />
          </div>
        </div>
        <div style={{ ...bfont, position: "absolute", top: 1395, left: 0, right: 0, textAlign: "center", fontSize: 34, color: ui.muted, letterSpacing: 1, opacity: urlIn }}>
          {BOOST.url}
        </div>
      </div>
      <Flash frame={frame} at={beats(2)} />
    </AbsoluteFill>
  );
};
