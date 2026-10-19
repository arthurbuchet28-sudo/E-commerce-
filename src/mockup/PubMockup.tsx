import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../components/Background";
import { DirectionalBlur } from "../lib/motionBlur";
import { Camera } from "../lib/timeline";
import { clamp, ease, lerp } from "../lib/utils";
import { Laptop3D } from "../site/components/Laptop";
import { A } from "../site/theme";
import { DeskPlane, Mug, Notebook, Wall } from "./components/Desk";
import { FINGERTIP, Hand, HAND_VIEWBOX } from "./components/Hand";
import { ScreenPlayer } from "./components/ScreenPlayer";
import { MOCKUP, T } from "./config";
import { basePoint, LaptopPose, LID_H, LID_W, PERSPECTIVE, project, TRACKPAD } from "./lib/geometry";
import { contactPoint, cursorState, handState } from "./lib/paths";

const BASE_THICKNESS = 23;
const HAND_SCALE = 0.85;
/** Affiche des repères rouges sur la base projetée (vérification de la géométrie). */
const DEBUG_POINTS = false;
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Pose du laptop (= mouvement de caméra) à chaque frame. */
export const laptopPose = (frame: number, fps: number, durationInFrames: number): LaptopPose => {
  const c = MOCKUP.camera;
  const t = frame / fps;
  // Établissement : léger travelling latéral + zoom 1,00 → 1,03
  const est = interpolate(frame, [0, T.click], [0, 1], { ...clampOpt, easing: ease.soft });
  // Rapprochement après le clic
  const push = interpolate(frame, [T.click, T.click + MOCKUP.timing.pushIn * fps], [0, 1], { ...clampOpt, easing: ease.inOut });
  // Recul final
  const back = interpolate(frame, [T.videoEnd - 10, durationInFrames], [0, 1], { ...clampOpt, easing: ease.out });
  const breathe = 1 + Math.sin(t * 0.8) * 0.006;

  let s = c.startScale * (1 + 0.03 * est);
  s = lerp(s, c.closeScale, push);
  s = lerp(s, c.endScale, back);
  return {
    s: s * breathe,
    tx: lerp(-70, 0, est) + Math.sin(t * 0.3) * 6,
    ty: lerp(lerp(-150, 25, push), -95, back) + Math.cos(t * 0.35) * 4,
    rx: c.rotateX + push * 4 - back * 3,
    ry: lerp(lerp(c.startRotateY, c.closeRotateY, push), -12, back),
  };
};

export const PubMockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  const pose = laptopPose(frame, fps, durationInFrames);
  const playing = frame >= T.play;
  const videoFrame = Math.min(MOCKUP.videoFrames - 1, Math.max(0, frame - T.play));
  // Luminosité approximative de la vidéo (pour le halo et le liseré sur la main)
  const screenLight = playing ? clamp(0.55 + 0.3 * Math.sin(t * 1.3) + 0.15 * Math.sin(t * 3.1)) : 0.25;

  // ── Main ──
  const handAt = (f: number) => {
    const p = laptopPose(f, fps, durationInFrames);
    const cp = contactPoint(f);
    const anchor = project(p, basePoint(cp.u, cp.v), W, H);
    const hs = handState(f, fps);
    return { anchor, hs, x: anchor.x + hs.x * anchor.k, y: anchor.y + hs.y * anchor.k };
  };
  const hand = handAt(frame);
  const prev = handAt(frame - 1);
  const vx = Math.abs(hand.x - prev.x);
  const vy = Math.abs(hand.y - prev.y);
  const sc = hand.anchor.k * HAND_SCALE * (1 + 0.08 * hand.hs.lift);
  const rim = (0.5 + 0.35 * screenLight) * (1 - hand.hs.lift * 0.4);

  // Coins du trackpad (pour l'assombrir au clic) + anneau de clic
  const tpCorners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([a, b]) => project(pose, basePoint(TRACKPAD.u + (a * TRACKPAD.w) / 2, TRACKPAD.v + (b * TRACKPAD.h) / 2), W, H));
  const ring = interpolate(frame, [T.click, T.click + 28], [0, 1], { ...clampOpt, easing: ease.out });
  const contactNow = project(pose, basePoint(contactPoint(frame).u, contactPoint(frame).v), W, H);

  // Accessoires (flous), posés sur le bureau derrière le laptop
  const mug = project(pose, basePoint(-1080, -120), W, H);
  const book = project(pose, basePoint(1120, -320), W, H);

  const cursor = cursorState(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: MOCKUP.wall }}>
      <Camera>
        <Wall t={t} screenLight={playing ? screenLight : 0} />
        <Mug x={mug.x} y={mug.y} k={mug.k / 0.62} />
        <Notebook x={book.x} y={book.y} k={book.k / 0.62} />

        {/* Laptop + bureau, dans le même repère 3D */}
        <AbsoluteFill style={{ perspective: PERSPECTIVE, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              width: LID_W,
              height: LID_H,
              transformStyle: "preserve-3d",
              transform: `translate3d(${pose.tx}px, ${pose.ty}px, 0) scale(${pose.s}) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg)`,
            }}
          >
            <DeskPlane lidW={LID_W} yTop={LID_H + BASE_THICKNESS} screenLight={screenLight} playing={playing} videoFrame={videoFrame} />
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
              <Laptop3D rotateY={pose.ry} lidTilt={MOCKUP.camera.lidTilt}>
                <ScreenPlayer frame={frame} fps={fps} cursor={cursor} cursorOpacity={cursor.opacity} />
              </Laptop3D>
            </div>
          </div>
        </AbsoluteFill>

        {/* Trackpad qui s'assombrit au clic + anneau lumineux sous le doigt */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {DEBUG_POINTS
            ? [
                [-710, 0],
                [710, 0],
                [710, 900],
                [-710, 900],
                [-270, 530],
                [270, 860],
              ].map(([u, v], i) => {
                const p = project(pose, basePoint(u, v), W, H);
                return <circle key={i} cx={p.x} cy={p.y} r={6} fill="red" />;
              })
            : null}
          <polygon points={tpCorners.map((p) => `${p.x},${p.y}`).join(" ")} fill="#000" opacity={0.12 * hand.hs.press} />
          {ring > 0 && ring < 1 ? (
            <ellipse
              cx={contactNow.x}
              cy={contactNow.y}
              rx={(20 + ring * 70) * contactNow.k}
              ry={(20 + ring * 70) * contactNow.k * 0.45}
              fill="none"
              stroke={A.light}
              strokeWidth={4}
              opacity={1 - ring}
              style={{ filter: `drop-shadow(0 0 8px ${A.base})` }}
            />
          ) : null}
        </svg>

        {/* Main (calque 2D ancré sur la projection du trackpad) */}
        {hand.hs.visible ? (
          <DirectionalBlur x={clamp(vx * 0.35, 0, 10)} y={clamp(vy * 0.35, 0, 10)}>
            <div
              style={{
                position: "absolute",
                left: hand.x - FINGERTIP.x * sc,
                top: hand.y - FINGERTIP.y * sc,
                width: HAND_VIEWBOX.w * sc,
                transformOrigin: `${FINGERTIP.x * sc}px ${FINGERTIP.y * sc}px`,
                transform: `perspective(1400px) rotateX(20deg) rotate(${hand.hs.rot}deg)`,
              }}
            >
              {/* ombre portée du corps de la main */}
              <div
                style={{
                  position: "absolute",
                  left: (250 + 60 * hand.hs.lift) * sc,
                  top: (330 + 90 * hand.hs.lift) * sc,
                  width: 330 * sc,
                  height: 470 * sc,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,1)",
                  opacity: lerp(0.32, 0.25, hand.hs.lift),
                  filter: `blur(${lerp(22, 40, hand.hs.lift) * sc}px)`,
                }}
              />
              {/* ombre de contact sous le bout de l'index */}
              <div
                style={{
                  position: "absolute",
                  left: (FINGERTIP.x - 34 + 24 * hand.hs.lift) * sc,
                  top: (FINGERTIP.y - 6 + 40 * hand.hs.lift) * sc,
                  width: 68 * sc,
                  height: 40 * sc,
                  borderRadius: "50%",
                  background: "#000",
                  opacity: 0.55 * (1 - hand.hs.lift),
                  filter: `blur(${lerp(6, 20, hand.hs.lift)}px)`,
                }}
              />
              <div style={{ position: "relative" }}>
                <Hand press={hand.hs.press} rim={rim} width={HAND_VIEWBOX.w * sc} />
              </div>
            </div>
          </DirectionalBlur>
        ) : null}

        {/* Lueur d'ambiance de l'écran (bloom très doux) */}
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `radial-gradient(ellipse 45% 40% at 50% 42%, ${A.a(playing ? 0.05 + 0.04 * screenLight : 0.02)} 0%, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />
      </Camera>
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      <Grain />
    </AbsoluteFill>
  );
};
