import React from "react";
import { Freeze, interpolate, OffthreadVideo, spring, staticFile } from "remotion";
import { clamp, ease, glow } from "../../lib/utils";
import { A, sfont } from "../../site/theme";
import { IconPlay } from "../../site/ui/kit";
import { MOCKUP, T } from "../config";
import { Cursor } from "./Cursor";

const W = 1280;
const H = 800;
const VH = 720;
export const PLAY_BUTTON = { x: W / 2, y: H / 2 };
/** Position de départ du curseur (repère de l'écran 1280×800). */
export const CURSOR_START = { x: 230, y: 640 };

const fmt = (frames: number) => {
  const s = Math.floor(frames / MOCKUP.fps);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Lecteur vidéo dans l'écran du laptop. La vidéo est toujours rendue via <Freeze>
 * sur la bonne image : 1re image en pause, lecture image par image, dernière image à la fin.
 */
export const ScreenPlayer: React.FC<{ frame: number; fps: number; cursor: { x: number; y: number }; cursorOpacity: number }> = ({
  frame,
  fps,
  cursor,
  cursorOpacity,
}) => {
  const videoFrame = Math.min(MOCKUP.videoFrames - 1, Math.max(0, frame - T.play));
  const playing = frame >= T.play;

  // Survol puis clic sur ▶
  const hover = interpolate(frame, [T.slide + 20, T.click], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const pop = spring({ frame: frame - T.click - 4, fps, config: { damping: 14, stiffness: 120 } });
  const btnScale = 1 + 0.08 * hover + 0.17 * pop;
  const btnOpacity = 1 - clamp(pop * 1.2);
  const ring = interpolate(frame, [T.click, T.click + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });

  const dim = interpolate(frame, [T.click + 2, T.play + 10], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const controls = interpolate(frame, [T.click + 60, T.click + 84], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const progress = videoFrame / (MOCKUP.videoFrames - 1);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: (H - VH) / 2, width: W, height: VH, filter: dim < 0.999 ? `brightness(${dim})` : undefined }}>
        <Freeze frame={videoFrame}>
          <OffthreadVideo src={staticFile(MOCKUP.video)} muted style={{ width: W, height: VH, display: "block" }} />
        </Freeze>
      </div>

      {/* Bouton ▶ */}
      {btnOpacity > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: PLAY_BUTTON.x - 60,
            top: PLAY_BUTTON.y - 60,
            width: 120,
            height: 120,
            borderRadius: 60,
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: glow(A.base, 0.8 + hover * 0.7),
            transform: `scale(${btnScale})`,
            opacity: btnOpacity,
            filter: pop > 0.02 ? `blur(${(pop * 8).toFixed(2)}px)` : undefined,
          }}
        >
          <div style={{ marginLeft: 8 }}>
            <IconPlay size={50} />
          </div>
        </div>
      ) : null}

      {/* Anneau de clic sous le curseur */}
      {ring > 0 && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            left: cursor.x - 50,
            top: cursor.y - 50,
            width: 100,
            height: 100,
            borderRadius: 50,
            border: `3px solid ${A.light}`,
            transform: `scale(${0.3 + ring * 1.4})`,
            opacity: 1 - ring,
            boxShadow: glow(A.base, 0.8),
          }}
        />
      ) : null}

      {/* Titre de la vidéo (visible en pause, s'efface avec les contrôles) */}
      {controls > 0 ? (
        <div
          style={{
            ...sfont,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            padding: "34px 40px 60px",
            background: "linear-gradient(rgba(0,0,0,0.7), transparent)",
            opacity: controls,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: A.pale }}>Lecture</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{MOCKUP.videoLabel}</div>
        </div>
      ) : null}

      {/* Barre de contrôles */}
      {controls > 0 ? (
        <div
          style={{
            ...sfont,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 110,
            background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
            display: "flex",
            alignItems: "flex-end",
            padding: "0 34px 26px",
            gap: 22,
            boxSizing: "border-box",
            opacity: controls,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {playing ? (
            <svg width={26} height={26} viewBox="0 0 24 24" fill="#fff">
              <rect x="5" y="4" width="5" height="16" rx="1.5" />
              <rect x="14" y="4" width="5" height="16" rx="1.5" />
            </svg>
          ) : (
            <IconPlay size={24} />
          )}
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.25)", marginBottom: 10 }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 3, background: A.light, boxShadow: `0 0 8px ${A.base}` }} />
          </div>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(videoFrame)} / {fmt(MOCKUP.videoFrames)}
          </span>
          {/* volume */}
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
          </svg>
          {/* plein écran */}
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </div>
      ) : null}

      {cursorOpacity > 0.01 ? <Cursor x={cursor.x} y={cursor.y} opacity={cursorOpacity} scale={1.3} /> : null}
    </div>
  );
};
