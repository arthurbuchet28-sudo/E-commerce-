import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring } from "remotion";
import { DirectionalBlur } from "../../lib/motionBlur";
import { useScene } from "../../lib/scene";
import { clamp, ease, glow, lerp, mix, textGlow } from "../../lib/utils";
import { BOOST, beats } from "../config";
import { BoostLogo } from "../components/BoostLogo";
import { Flash, shake } from "../components/fx";
import { Kinetic } from "../components/Kinetic";
import { Thread } from "../components/Thread";
import { O, Y, bfont, flame, formatViews, ui } from "../theme";
import { Bolt, Check, Clock, Comment, Heart, Trend, UserPlus } from "../ui/icons";
import { FeaturePanel, WhipStreaks, whipP } from "./Act3";

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

/* ───────────────────────── Scène 4 — Solution (6-10 s) ───────────────────────── */

const CARD = { x: 115, y: 290, w: 820, h: 1170 };

export const S4Solution: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;
  // sortie du zoom : la lumière chaude se retire, le dashboard sort du centre
  const emerge = interpolate(frame, [0, beats(0.9)], [0, 1], { ...clampOpt, easing: ease.out });
  const warm = 1 - interpolate(frame, [0, beats(0.8)], [0, 1], { ...clampOpt, easing: ease.out });
  // (a) scan du profil
  const scan = interpolate(frame, [beats(1), beats(2.4)], [0, 1], { ...clampOpt, easing: ease.inOut });
  const scanned = frame >= beats(2.5);
  // (b) score 0 → 92
  const scoreP = interpolate(frame, [beats(2.5), beats(5)], [0, 1], { ...clampOpt, easing: ease.out });
  const scorePrev = interpolate(frame - 1, [beats(2.5), beats(5)], [0, 1], { ...clampOpt, easing: ease.out });
  const score = scoreP * BOOST.score;
  const scoreBlur = clamp((scoreP - scorePrev) * 220, 0, 6);
  // (c) recommandations, sur les demi-temps
  const recoStart = beats(5);
  // tension du dernier temps : ça ralentit, l'image s'assombrit
  const tension = interpolate(frame, [duration - beats(1), duration], [0, 1], { ...clampOpt, easing: ease.in });

  const rx = 5 + Math.sin(t * 0.7) * 1.5;
  const ry = -4 + Math.sin(t * 0.5) * 3;
  const cardScale = lerp(1.35, 1, emerge) * (1 + 0.02 * tension);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            transformStyle: "preserve-3d",
            transform: `scale(${cardScale}) rotateX(${rx}deg) rotateY(${ry}deg)`,
            opacity: clamp(emerge * 1.5),
          }}
        >
          {/* fond de la carte (plat, les éléments 3D sont à côté) */}
          <div style={{ ...glass, position: "absolute", inset: 0, filter: emerge < 0.98 ? `blur(${((1 - emerge) * 16).toFixed(2)}px)` : undefined }}>
            {/* en-tête */}
            <div style={{ ...bfont, position: "absolute", left: 34, right: 34, top: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 34, letterSpacing: "-0.03em" }}>
                <BoostLogo size={50} draw={1} fill={1} glowStrength={0.5} /> {BOOST.siteName}
              </div>
              <div style={{ padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: `1px solid ${ui.border}`, fontSize: 20, color: ui.muted }}>
                {BOOST.url}
              </div>
            </div>
            {/* profil + scan */}
            <div style={{ ...glass, position: "absolute", left: 30, right: 30, top: 116, height: 150, borderRadius: 24, display: "flex", alignItems: "center", gap: 22, padding: "0 26px", overflow: "hidden" }}>
              <div style={{ width: 92, height: 92, borderRadius: 46, background: flame(), ...bfont, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 40, boxShadow: glow(O.base, 0.4) }}>
                {BOOST.accountName[0]}
              </div>
              <div style={{ ...bfont, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 32 }}>{BOOST.account}</div>
                <div style={{ fontSize: 21, color: ui.muted, marginTop: 6 }}>{BOOST.accountBio}</div>
              </div>
              <div
                style={{
                  ...bfont,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 999,
                  fontSize: 19,
                  fontWeight: 800,
                  color: scanned ? "#1a0d06" : O.pale,
                  background: scanned ? flame() : O.a(0.14),
                  border: `1px solid ${O.a(0.4)}`,
                }}
              >
                {scanned ? <Check size={18} color="#1a0d06" /> : null}
                {scanned ? "Analysé" : "Analyse…"}
              </div>
              {/* barre de lumière qui balaie le profil */}
              {scan > 0 && scan < 1 ? (
                <>
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${scan * 100}%`, background: `linear-gradient(90deg, transparent, ${O.a(0.16)})` }} />
                  <div style={{ position: "absolute", top: -10, bottom: -10, left: `${scan * 100}%`, width: 6, background: "#fff", boxShadow: `0 0 18px ${Y.base}, 0 0 40px ${O.base}` }} />
                </>
              ) : null}
            </div>
            {/* score de viralité */}
            <div style={{ position: "absolute", left: 30, right: 30, top: 292, height: 330, display: "flex", alignItems: "center", gap: 40, padding: "0 20px" }}>
              <ScoreRing p={scoreP} value={score} blur={scoreBlur} />
              <div style={{ ...bfont }}>
                <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em" }}>Score de viralité</div>
                <div style={{ fontSize: 24, color: ui.muted, marginTop: 10 }}>
                  Top <span style={{ color: Y.base }}>8 %</span> de ta catégorie
                </div>
              </div>
            </div>
          </div>
          {/* recommandations : flottent devant la carte (3D + profondeur de champ) */}
          {BOOST.recos.map((rc, i) => {
            const p = spring({ frame: frame - recoStart - i * beats(0.5), fps, config: { damping: 14, stiffness: 120 } });
            const z = 50 + i * 30 + Math.sin(t * 1.1 + i) * 10;
            const focusZ = 80;
            const dof = clamp(Math.abs(z - focusZ) / 55, 0, 14) * 0.6;
            const Icon = [Clock, Bolt, Trend][i];
            return (
              <div
                key={i}
                style={{
                  ...glass,
                  ...bfont,
                  position: "absolute",
                  left: 30 + (i % 2) * 18,
                  width: CARD.w - 60 - 18,
                  top: 650 + i * 165,
                  height: 140,
                  borderRadius: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "0 26px",
                  transform: `translateZ(${z * p}px) scale(${0.6 + 0.4 * p}) rotateX(${(1 - p) * -30}deg)`,
                  opacity: clamp(p * 1.5),
                  filter: dof > 0.3 ? `blur(${dof.toFixed(2)}px)` : undefined,
                  border: `1px solid ${O.a(0.3)}`,
                  boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${O.a(0.15 * p)}`,
                }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 20, background: O.a(0.18), border: `1px solid ${O.a(0.45)}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: glow(O.base, 0.4) }}>
                  <Icon size={36} color={Y.light} />
                </div>
                <div>
                  <div style={{ fontSize: 22, color: ui.muted }}>{rc.label}</div>
                  <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: "-0.03em", marginTop: 4 }}>{rc.value}</div>
                </div>
              </div>
            );
          })}
          {/* le fil orange court d'une carte à l'autre */}
          <Thread
            d={`M66 520 C20 600 20 640 66 720 C110 790 110 830 84 885 C40 960 40 1000 66 1050`}
            width={CARD.w}
            height={CARD.h}
            draw={interpolate(frame, [recoStart - beats(0.5), recoStart + beats(1.6)], [0, 1], { ...clampOpt, easing: ease.inOut })}
            heat={1}
            stroke={4}
            style={{ transform: "translateZ(30px)" }}
          />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 1515, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kinetic words={[...BOOST.text.solution]} frame={frame} start={beats(4)} stagger={beats(0.5)} fps={fps} size={66} />
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: tension * 0.35 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${mix(Y.pale, "#ffffff", 0.4)} 0%, ${O.light} 50%, ${O.base} 100%)`, opacity: warm }} />
    </AbsoluteFill>
  );
};

const ScoreRing: React.FC<{ p: number; value: number; blur: number }> = ({ p, value, blur }) => {
  const size = 270;
  const sw = 24;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <defs>
          <linearGradient id="ringFlame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={Y.base} />
            <stop offset="100%" stopColor={O.base} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={sw} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringFlame)"
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p * (BOOST.score / 100))}
          style={{ filter: `drop-shadow(0 0 10px ${O.base}) drop-shadow(0 0 24px ${O.a(0.6)})` }}
        />
      </svg>
      <div
        style={{
          ...bfont,
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 104,
          letterSpacing: "-0.05em",
          fontVariantNumeric: "tabular-nums",
          filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
          textShadow: textGlow(O.base, 0.4),
        }}
      >
        {Math.round(value)}
      </div>
    </div>
  );
};

/* ───────────────────────── Scène 5 — Preuve (10-14 s) ───────────────────────── */

type Pt = { x: number; y: number };
const C0 = { x: 90, y: 1500 };
const C1 = { x: 560, y: 1490 };
const C2 = { x: 800, y: 1120 };
const C3 = { x: 930, y: 380 };
const bez = (u: number): Pt => {
  const v = 1 - u;
  return {
    x: v * v * v * C0.x + 3 * v * v * u * C1.x + 3 * v * u * u * C2.x + u * u * u * C3.x,
    y: v * v * v * C0.y + 3 * v * v * u * C1.y + 3 * v * u * u * C2.y + u * u * u * C3.y,
  };
};
const CURVE = `M${C0.x} ${C0.y} C${C1.x} ${C1.y} ${C2.x} ${C2.y} ${C3.x} ${C3.y}`;

export const S5Proof: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const sk = shake(frame, 0, 6);
  // montée de vitesse : la courbe part lentement puis accélère fort
  const drawAt = (f: number) => interpolate(f, [0, beats(1.8)], [0, 1], { ...clampOpt, easing: (x) => x * x * x });
  const draw = drawAt(frame);
  // compteur 214 → 1,2 M
  // le compteur accélère avec la courbe (montée de vitesse), puis ralentit à l'arrivée
  const countAt = (f: number) => interpolate(f, [8, beats(3.7)], [BOOST.viewsBefore, BOOST.viewsAfter], { ...clampOpt, easing: Easing.bezier(0.55, 0, 0.15, 1) });
  const views = countAt(frame);
  const vBlur = clamp(((countAt(frame) - countAt(frame - 1)) / BOOST.viewsAfter) * 900, 0, 8);
  const arrived = beats(3.7);
  const landPop = spring({ frame: frame - arrived, fps, config: { damping: 10, stiffness: 160, mass: 0.6 } });
  const followers = spring({ frame: frame - beats(4), fps, config: { damping: 14, stiffness: 130 } });
  const breathe = frame > beats(6) ? 1 + Math.sin((frame - beats(6)) / 6) * 0.015 : 1;
  // sortie en whip pan vers la gauche
  // (le premier panneau « Analyse » arrive en même temps, côte à côte : pas d'image vide au raccord)
  const whip = (f: number) => -W * whipP(f, duration);
  const wx = whip(frame);
  const wv = Math.abs(wx - whip(frame - 1));

  return (
    <AbsoluteFill style={{ transform: `translate(${sk.x}px, ${sk.y}px)` }}>
      <DirectionalBlur x={clamp(wv * 0.35, 0, 40)} y={0}>
        <AbsoluteFill style={{ transform: `translateX(${wx}px) scale(${1 + 0.03 * (frame / duration)})` }}>
          {/* courbe de croissance + aire */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="areaFlame" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={O.base} stopOpacity={0.35} />
                <stop offset="100%" stopColor={O.base} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={`${CURVE} L${C3.x} 1520 L${C0.x} 1520 Z`} fill="url(#areaFlame)" opacity={clamp((draw - 0.6) * 2.5) * 0.9} />
          </svg>
          <Thread d={CURVE} width={W} height={H} draw={draw} heat={1} stroke={7} />
          {/* étincelles qui s'échappent de la tête de la courbe */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {Array.from({ length: 36 }).map((_, k) => {
              const born = k * 1.5;
              const age = frame - born;
              if (age < 0 || age > 34) return null;
              const p0 = bez(drawAt(born));
              const vx = (random(`sx${k}`) - 0.6) * 9;
              const vy = (random(`sy${k}`) - 0.3) * -9;
              const x = p0.x + vx * age;
              const y = p0.y + vy * age + 0.12 * age * age;
              return <circle key={k} cx={x} cy={y} r={2 + random(`sr${k}`) * 3} fill={k % 3 ? Y.light : "#fff"} opacity={1 - age / 34} style={{ filter: `drop-shadow(0 0 6px ${O.base})` }} />;
            })}
          </svg>

          {/* notifications en cascade (3D, profondeur de champ, flou de mouvement) */}
          <AbsoluteFill style={{ perspective: 1400 }}>
            {BOOST.notifications.map((n, i) => {
              const born = 18 + i * 12;
              const life = 80;
              const age = frame - born;
              if (age < 0 || age > life) return null;
              const yAt = (a: number) => lerp(1780, 220, interpolate(a, [0, life], [0, 1], { ...clampOpt, easing: ease.inOut }));
              const y = yAt(age);
              const vy = Math.abs(y - yAt(age - 1));
              const z = [-260, 140, -80, 220, -180, 60, -300, 160][i % 8];
              const dof = clamp(Math.abs(z) / 55, 0, 14);
              const x = i % 2 ? 360 : 70;
              const Icon = n.kind === "like" ? Heart : n.kind === "comment" ? Comment : UserPlus;
              const fade = interpolate(age, [0, 10, life - 14, life], [0, 1, 1, 0], clampOpt);
              return (
                <div
                  key={i}
                  style={{
                    ...glass,
                    ...bfont,
                    position: "absolute",
                    left: x,
                    top: y,
                    width: 520,
                    height: 96,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "0 26px 0 14px",
                    fontSize: 26,
                    transform: `translateZ(${z}px) rotateY(${i % 2 ? -10 : 10}deg)`,
                    opacity: fade,
                    filter: `blur(${(dof + vy * 0.25).toFixed(2)}px)`,
                  }}
                >
                  <div style={{ width: 68, height: 68, borderRadius: 34, background: n.kind === "follow" ? flame() : O.a(0.2), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={34} color={n.kind === "follow" ? "#1a0d06" : O.light} fill={n.kind === "like"} />
                  </div>
                  <span style={{ whiteSpace: "nowrap" }}>{n.text}</span>
                </div>
              );
            })}
          </AbsoluteFill>

          {/* compteur */}
          <div style={{ ...bfont, position: "absolute", left: 80, right: 0, top: 520, textAlign: "left", transformOrigin: "0 50%", transform: `scale(${breathe * (1 + 0.08 * (1 - landPop) * (frame >= arrived ? 1 : 0))})` }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 220,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                textShadow: textGlow(O.base, 0.6 + (frame >= arrived ? 0.5 + 0.3 * Math.sin(frame / 8) : 0)),
              }}
            >
              <DirectionalBlurInline y={vBlur}>{formatViews(views)}</DirectionalBlurInline>
            </div>
            <div style={{ fontSize: 46, color: ui.muted, marginTop: 6 }}>vues</div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginTop: 34,
                padding: "16px 30px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 44,
                color: "#1a0d06",
                background: flame(),
                boxShadow: glow(O.base, 0.9),
                transform: `scale(${Math.max(0, followers)})`,
                opacity: clamp(followers * 3),
              }}
            >
              <UserPlus size={40} color="#1a0d06" /> {BOOST.followersGain}
            </div>
          </div>
          {/* cœurs qui s'échappent du compteur à l'arrivée */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {Array.from({ length: 26 }).map((_, k) => {
              const age = frame - arrived;
              if (age < 0 || age > 60) return null;
              const a = random(`ha${k}`) * Math.PI * 2;
              const sp = 6 + random(`hs${k}`) * 10;
              const x = 330 + Math.cos(a) * sp * age;
              const y = 630 + Math.sin(a) * sp * age * 0.7 - age * 2;
              const s = 0.8 + random(`hz${k}`) * 1.2;
              return (
                <path
                  key={k}
                  d="M0 6 C-8 -2 -14 6 -6 13 L0 18 L6 13 C14 6 8 -2 0 6 Z"
                  transform={`translate(${x} ${y}) scale(${s * 1.6}) rotate(${(random(`hr${k}`) - 0.5) * 60})`}
                  fill={k % 2 ? O.base : Y.base}
                  opacity={1 - age / 60}
                />
              );
            })}
          </svg>
        </AbsoluteFill>
      </DirectionalBlur>
      {whipP(frame, duration) > 0 ? (
        <DirectionalBlur x={clamp(wv * 0.3, 0, 40)} y={0}>
          <AbsoluteFill style={{ transform: `translateX(${W + wx}px)` }}>
            <FeaturePanel i={0} f={frame - duration} fps={fps} />
          </AbsoluteFill>
        </DirectionalBlur>
      ) : null}
      <WhipStreaks k={Math.sin(whipP(frame, duration) * Math.PI)} seed="s5" />
      <Flash frame={frame} at={0} />
    </AbsoluteFill>
  );
};

/** Flou vertical sur les chiffres qui défilent vite. */
const DirectionalBlurInline: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <span style={{ display: "inline-block", filter: y > 0.3 ? `blur(${(y * 0.6).toFixed(2)}px)` : undefined, transform: y > 0.3 ? `scaleY(${1 + y * 0.012})` : undefined }}>{children}</span>
);
