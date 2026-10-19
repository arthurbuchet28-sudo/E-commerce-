import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { Phone3D } from "../../components/Phone";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp, mix } from "../../lib/utils";
import { BOOST, beats } from "../config";
import { Flash, shake } from "../components/fx";
import { Kinetic } from "../components/Kinetic";
import { Thread } from "../components/Thread";
import { O, Y, bfont, ui } from "../theme";
import { FeedScreen } from "../ui/Feed";
import { Eye } from "../ui/icons";

const W = 1080;
const H = 1920;
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* Repères partagés entre les scènes (raccords) */
export const BIG214 = { x: 540, y: 900, size: 300 };
export const PHONE = { x: 540, y: 1010, scale: 0.95 };
/** Position approximative du badge de vues une fois le téléphone posé (pour le raccord par la forme). */
const BADGE = { x: 436, y: 728, scale: 0.068 };
export const LINE_Y = 1560;
export const FLAT_LINE = `M60 ${LINE_Y} L330 ${LINE_Y} L345 ${LINE_Y - 4} L360 ${LINE_Y + 5} L375 ${LINE_Y} L1020 ${LINE_Y}`;
export const PULSE_LINE = `M60 ${LINE_Y} L360 ${LINE_Y} L392 ${LINE_Y - 70} L428 ${LINE_Y + 60} L460 ${LINE_Y - 30} L484 ${LINE_Y} L700 ${LINE_Y} L724 ${LINE_Y - 40} L748 ${LINE_Y + 30} L768 ${LINE_Y} L1020 ${LINE_Y}`;

/** Dérive lente propre à chaque plan (la caméra n'est jamais immobile). */
const drift = (frame: number, dur: number, amount = 0.04, base = 1) =>
  `scale(${base + amount * (frame / dur)}) rotate(${Math.sin(frame / 40) * 0.4}deg)`;

/** Pose du téléphone posé (« problème »), avec un léger flottement. */
const restPose = (absFrame: number, fps: number) => {
  const t = absFrame / fps;
  return { ry: -14 + Math.sin(t * 0.7) * 2, rx: 6 + Math.sin(t * 0.9) * 1, y: Math.sin(t * 1.2) * 6 };
};

/* ───────────────────────── Scène 1 — Accroche (0-2 s) ───────────────────────── */

export const S1Hook: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const numberIn = spring({ frame: frame - beats(2), fps, config: { damping: 16, stiffness: 110 } });
  // le compteur hésite : 214 → 215 → 214
  const flick = frame >= beats(2.7) && frame < beats(3.2) ? 1 : 0;
  const flickSlide = interpolate(frame, [beats(2.7), beats(2.7) + 6, beats(3.2), beats(3.2) + 6], [0, 1, 1, 0], clampOpt);
  const exit = interpolate(frame, [duration - 16, duration], [0, 1], { ...clampOpt, easing: ease.in });
  return (
    <AbsoluteFill style={{ background: BOOST.black }}>
      <AbsoluteFill style={{ transform: drift(frame, duration, 0.02), alignItems: "center" }}>
        <div style={{ position: "absolute", top: 640, width: W, display: "flex", justifyContent: "center" }}>
          <Kinetic words={BOOST.text.hook1.map((w) => ({ w }))} frame={frame} start={-8} stagger={beats(0.5)} fps={fps} size={112} exit={exit} />
        </div>
        {/* « 214 » : il reste à l'écran pour le raccord avec la scène suivante */}
        <div
          style={{
            ...bfont,
            position: "absolute",
            left: 0,
            right: 0,
            top: BIG214.y - BIG214.size * 0.55,
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            gap: 26,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: BIG214.size,
              letterSpacing: "-0.05em",
              color: ui.grey,
              opacity: clamp(numberIn * 1.4),
              transform: `translateY(${(1 - numberIn) * 40}px)`,
              filter: numberIn < 0.98 ? `blur(${((1 - numberIn) * 12).toFixed(2)}px)` : undefined,
            }}
          >
            {BOOST.viewsBefore}
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 112,
              letterSpacing: "-0.04em",
              opacity: clamp(numberIn * 1.4) * (1 - exit),
              filter: exit > 0.01 ? `blur(${exit * 14}px)` : undefined,
            }}
          >
            vues.
          </span>
        </div>
        {/* petit compteur figé */}
        <div
          style={{
            ...bfont,
            position: "absolute",
            top: 1130,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 40,
            color: ui.muted,
            opacity: clamp((frame - beats(2.4)) / 12) * (1 - exit),
          }}
        >
          <Eye size={40} color={ui.muted} />
          <span style={{ display: "inline-block", width: 90, fontVariantNumeric: "tabular-nums", transform: `translateY(${-flickSlide * 4}px)` }}>
            {BOOST.viewsBefore + flick}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────── Scène 2 — Problème (2-4 s) ───────────────────────── */

const PhoneOnStage: React.FC<{ ry: number; rx: number; y: number; z: number; scale: number; views: number; t: number; viewsOpacity: number; screenGlow?: number }> = ({
  ry,
  rx,
  y,
  z,
  scale,
  views,
  t,
  viewsOpacity,
  screenGlow = 0,
}) => (
  <AbsoluteFill style={{ perspective: 2200 }}>
    <div
      style={{
        position: "absolute",
        left: PHONE.x - 205,
        top: PHONE.y - 425,
        transformStyle: "preserve-3d",
        transform: `translate3d(0, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`,
      }}
    >
      <Phone3D rotateY={ry}>
        <FeedScreen views={views} t={t} viewsOpacity={viewsOpacity} />
        {screenGlow > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${mix(Y.pale, "#ffffff", 0.4)} 0%, ${O.light} 45%, ${O.base} 100%)`,
              opacity: screenGlow,
            }}
          />
        ) : null}
      </Phone3D>
    </div>
  </AbsoluteFill>
);

export const S2Problem: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;
  // arrivée du téléphone de 3/4
  const a = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const rest = restPose(absFrame, fps);
  const ry = lerp(38, rest.ry, a);
  const z = lerp(-520, 0, a);
  const py = lerp(140, rest.y, a);
  // raccord par la forme : le « 214 » de l'accroche devient le badge de vues
  const m = interpolate(frame, [0, beats(1.1)], [0, 1], { ...clampOpt, easing: ease.inOut });
  const bigX = lerp(BIG214.x, BADGE.x, m);
  const bigY = lerp(BIG214.y, BADGE.y, m);
  const bigS = lerp(1.02, BADGE.scale, m); // 1,02 = dérive de fin de la scène 1
  const handoff = interpolate(frame, [beats(0.95), beats(1.25)], [0, 1], clampOpt);
  const dark = interpolate(frame, [0, beats(0.8)], [1, 0], clampOpt);
  const lineDraw = interpolate(frame, [beats(0.3), beats(2)], [0, 1], { ...clampOpt, easing: ease.out });
  const exit = interpolate(frame, [duration - 14, duration], [0, 1], { ...clampOpt, easing: ease.in });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BOOST.black, opacity: dark }} />
      <AbsoluteFill style={{ transform: drift(frame, duration, 0.025) }}>
        <PhoneOnStage ry={ry} rx={rest.rx} y={py} z={z} scale={PHONE.scale} views={BOOST.viewsBefore} t={t} viewsOpacity={handoff} />
        <Thread d={FLAT_LINE} width={W} height={H} draw={lineDraw} heat={0} head={false} />
        <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic words={[...BOOST.text.problem]} frame={frame} start={6} stagger={12} fps={fps} size={92} keyColor={ui.muted} exit={exit} />
        </div>
      </AbsoluteFill>
      {/* le « 214 » en vol */}
      {handoff < 1 ? (
        <div
          style={{
            ...bfont,
            position: "absolute",
            left: bigX,
            top: bigY,
            transform: `translate(-50%, -50%) scale(${bigS})`,
            fontWeight: 800,
            fontSize: BIG214.size,
            letterSpacing: "-0.05em",
            color: mix(ui.grey, "#ffffff", m),
            opacity: 1 - handoff,
            filter: m > 0.1 && m < 0.9 ? `blur(${(Math.sin(m * Math.PI) * 4).toFixed(2)}px)` : undefined,
          }}
        >
          {BOOST.viewsBefore}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ───────────────────────── Scène 3 — Révélation (4-6 s) ───────────────────────── */

export const S3Reveal: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;
  const sk = shake(frame, 0, 6);
  const rest = restPose(absFrame, fps);
  const back = spring({ frame, fps, config: { damping: 22, stiffness: 50 } });
  const ignite = interpolate(frame, [0, beats(1.3)], [0, 1], { ...clampOpt, easing: ease.out });
  // zoom traversant dans l'écran sur le dernier temps
  const dive = interpolate(frame, [duration - beats(1.2), duration], [0, 1], { ...clampOpt, easing: (x) => x * x * x });
  const scale = PHONE.scale * (1 - 0.18 * back) * (1 + dive * 7);
  const exitText = interpolate(frame, [duration - beats(1.2), duration - beats(0.6)], [0, 1], clampOpt);
  const warm = interpolate(dive, [0.45, 1], [0, 1], clampOpt);
  return (
    <AbsoluteFill style={{ transform: `translate(${sk.x}px, ${sk.y}px)` }}>
      <AbsoluteFill style={{ transform: drift(frame, duration, 0.03, 1.025) }}>
        <PhoneOnStage
          ry={lerp(rest.ry, 12, back) * (1 - dive)}
          rx={rest.rx * (1 - dive)}
          y={rest.y * (1 - dive) - dive * 40}
          z={lerp(0, -240, back) * (1 - dive)}
          scale={scale}
          views={BOOST.viewsBefore}
          t={t}
          viewsOpacity={1}
          screenGlow={interpolate(dive, [0.2, 0.9], [0, 1], clampOpt)}
        />
        <div style={{ opacity: 1 - exitText }}>
          <Thread d={FLAT_LINE} width={W} height={H} draw={1} heat={0} head={false} style={{ opacity: 1 - ignite }} />
          <Thread d={PULSE_LINE} width={W} height={H} draw={ignite} heat={1} />
        </div>
        <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic words={[...BOOST.text.reveal]} frame={frame} start={beats(0.3)} stagger={beats(0.5)} fps={fps} size={100} exit={exitText} />
        </div>
      </AbsoluteFill>
      {/* lumière chaude qui envahit l'image à la fin du zoom (raccord avec la scène 4) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${mix(Y.pale, "#ffffff", 0.4)} 0%, ${O.light} 50%, ${O.base} 100%)`,
          opacity: warm,
        }}
      />
      <Flash frame={frame} at={0} />
    </AbsoluteFill>
  );
};
