import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease, glow } from "../../lib/utils";
import { SITE } from "../config";
import { LightTrail } from "../components/LightTrail";
import { useLayout } from "../layout";
import { A, B, brandGradient, sfont, ui } from "../theme";
import { AIThumb, IconPlay, IconSpark } from "../ui/kit";

/** Géométrie (repère centré) : paysage 16:9 ou portrait 9:16. */
const geometry = (vertical: boolean) => {
  const FIELD_W = vertical ? 960 : 1240;
  const FIELD_H = vertical ? 300 : 150;
  const FIELD_Y = vertical ? -540 : -330; // haut du champ
  const THUMB_W = vertical ? 960 : 780;
  return {
    FIELD_W,
    FIELD_H,
    FIELD_R: 30,
    FIELD_Y,
    THUMB_W,
    THUMB_H: (THUMB_W * 9) / 16,
    THUMB_Y: FIELD_Y + FIELD_H + (vertical ? 120 : 120), // haut de la vignette
    THUMB_R: 26,
  };
};

/** Scène 3 (6,5-10 s) : le prompt se tape, « Générer », la vidéo se génère sous une traînée néon. */
export const Scene3Generate: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const { vertical } = useLayout();
  const { FIELD_W, FIELD_H, FIELD_R, FIELD_Y, THUMB_W, THUMB_H, THUMB_Y, THUMB_R } = geometry(vertical);
  const t = absFrame / fps;
  const text = SITE.prompt;

  const enter = spring({ frame: frame + 8, fps, config: { damping: 22, stiffness: 60 } });

  // Frappe : ~2 caractères/frame au départ, puis ralentit
  // (+3 : laisse aux dernières lettres le temps de finir leur fondu)
  const typed = interpolate(frame, [6, 98], [0, text.length + 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const typing = typed < text.length;
  const caretOn = typing || Math.floor(frame / 16) % 2 === 0;

  // Bouton enfoncé
  const press = interpolate(frame, [102, 108, 122], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const buttonScale = 1 - 0.06 * press;

  // Traînées autour du champ
  const trailOn = interpolate(frame, [106, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const trailOffset = -interpolate(frame, [106, 230], [0.62, 2.2], { easing: ease.soft });

  // Génération
  const progress = interpolate(frame, [116, 192], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const thumbIn = spring({ frame: frame - 108, fps, config: { damping: 20, stiffness: 70 } });
  const reveal = interpolate(progress, [0.1, 1], [0, 135], { extrapolateLeft: "clamp" });
  const done = spring({ frame: frame - 192, fps, config: { damping: 10, stiffness: 150, mass: 0.7 } });
  const shock = interpolate(frame, [192, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const beam = interpolate(frame, [110, 124, 188, 204], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ry = -3 + Math.sin(t * 0.55) * 3.5;
  const rx = 6 * (1 - enter) + 4 + Math.sin(t * 0.7) * 1;
  const camScale = interpolate(frame, [0, 230], [0.98, 1.04]);

  return (
    <AbsoluteFill style={{ perspective: 1900, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 1600,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${A.a(0.18 + 0.1 * progress)} 0%, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          width: 0,
          height: 0,
          // groupe plat : tous les éléments sont dans le même plan (évite les erreurs de tri 3D)
          transform: `scale(${camScale}) translateZ(${-500 * (1 - enter)}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          opacity: enter,
        }}
      >
        {/* ── Champ de prompt ── */}
        <div style={{ position: "absolute", left: -FIELD_W / 2, top: FIELD_Y, width: FIELD_W, height: FIELD_H }}>
          <div
            style={{
              ...sfont,
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              borderRadius: FIELD_R,
              background: "linear-gradient(160deg, rgba(255,255,255,0.1), rgba(255,255,255,0.035))",
              backgroundColor: ui.cardSolid,
              border: `1px solid ${A.a(0.5)}`,
              boxShadow: `0 0 0 6px ${A.a(0.07)}, 0 0 70px ${A.a(0.3)}, 0 40px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
              display: "flex",
              alignItems: vertical ? "flex-start" : "center",
              alignContent: "center",
              flexWrap: vertical ? "wrap" : "nowrap",
              gap: 26,
              rowGap: 24,
              padding: vertical ? "34px 30px" : "0 22px 0 36px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: 20,
                background: A.a(0.2),
                border: `1px solid ${A.a(0.5)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: glow(A.base, 0.5),
              }}
            >
              <IconSpark size={34} color={A.pale} />
            </div>
            <div
              style={{
                flex: vertical ? "0 0 calc(100% - 90px)" : 1,
                fontSize: vertical ? 38 : 34,
                fontWeight: 500,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                minHeight: vertical ? 144 : undefined,
              }}
            >
              {text.split("").map((ch, i) => {
                const a = clamp((typed - i) / 3);
                if (a <= 0) return null;
                return (
                  <span key={i} style={{ opacity: a, filter: a < 1 ? `blur(${((1 - a) * 4).toFixed(2)}px)` : undefined }}>
                    {ch}
                  </span>
                );
              })}
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 38,
                  marginLeft: 3,
                  verticalAlign: "-6px",
                  background: A.light,
                  boxShadow: `0 0 10px ${A.base}`,
                  opacity: caretOn && frame < 118 ? 1 : 0,
                }}
              />
            </div>
            <div
              style={{
                height: 84,
                flexShrink: 0,
                marginLeft: vertical ? "auto" : undefined,
                padding: "0 40px",
                borderRadius: 22,
                background: brandGradient(),
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 28,
                fontWeight: 800,
                transform: `scale(${buttonScale})`,
                boxShadow: `${glow(A.base, 0.8 + press * 0.8)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
              }}
            >
              <IconSpark size={28} filled /> {SITE.generateLabel}
            </div>
          </div>
          <LightTrail width={FIELD_W} height={FIELD_H} radius={FIELD_R} offset={trailOffset} length={0.16} intensity={trailOn} />
          <LightTrail width={FIELD_W} height={FIELD_H} radius={FIELD_R} offset={trailOffset + 0.5} length={0.07} intensity={trailOn * 0.55} />
        </div>

        {/* ── Faisceau qui « déverse » la lumière vers la vignette ── */}
        <svg
          width={200}
          height={THUMB_Y - (FIELD_Y + FIELD_H) + 20}
          style={{ position: "absolute", left: -100, top: FIELD_Y + FIELD_H - 10, overflow: "visible", opacity: beam }}
        >
          <defs>
            <filter id="beamBlur" x="-200%" y="-20%" width="500%" height="140%">
              <feGaussianBlur stdDeviation={8} />
            </filter>
          </defs>
          <line x1={100} x2={100} y1={0} y2={THUMB_Y - (FIELD_Y + FIELD_H) + 20} stroke={A.base} strokeWidth={16} filter="url(#beamBlur)" />
          <line x1={100} x2={100} y1={0} y2={THUMB_Y - (FIELD_Y + FIELD_H) + 20} stroke={B.pale} strokeWidth={3} />
          {Array.from({ length: 8 }).map((_, k) => {
            const len = THUMB_Y - (FIELD_Y + FIELD_H) + 20;
            const u = (((frame / fps) * 1.6 + k / 8) % 1 + 1) % 1;
            const x = 100 + (random(`bx${k}`) - 0.5) * 30 * Math.sin(u * Math.PI);
            return (
              <g key={k} opacity={Math.sin(u * Math.PI)}>
                <circle cx={x} cy={u * len} r={8} fill={B.base} filter="url(#beamBlur)" />
                <circle cx={x} cy={u * len} r={2.5} fill="#fff" />
              </g>
            );
          })}
        </svg>

        {/* ── Vignette vidéo générée ── */}
        <div
          style={{
            position: "absolute",
            left: -THUMB_W / 2,
            top: THUMB_Y,
            width: THUMB_W,
            height: THUMB_H,
            opacity: thumbIn,
            transform: `translateY(${(1 - thumbIn) * 50}px) scale(${0.92 + 0.08 * thumbIn})`,
          }}
        >
          {/* onde de choc */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: THUMB_R,
              border: `2px solid ${B.light}`,
              transform: `scale(${1 + shock * 0.18})`,
              opacity: shock > 0 ? (1 - shock) * 0.9 : 0,
              boxShadow: glow(A.base, 1.2),
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: THUMB_R,
              overflow: "hidden",
              background: "#0B0918",
              border: `1px solid ${ui.border}`,
              boxShadow: `0 50px 100px rgba(0,0,0,0.55), 0 0 ${60 + 50 * done}px ${A.a(0.3 + 0.2 * done)}`,
            }}
          >
            {/* squelette avant génération */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(110deg, transparent 30%, ${A.a(0.16)} 50%, transparent 70%)`,
                backgroundSize: "250% 100%",
                backgroundPosition: `${120 - ((frame * 1.6) % 140)}% 0`,
              }}
            />
            {/* image révélée par balayage diagonal */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `polygon(0 0, ${reveal}% 0, ${reveal - 35}% 100%, 0 100%)`,
                filter: progress < 1 ? `blur(${((1 - progress) * 18).toFixed(2)}px)` : undefined,
              }}
            >
              <AIThumb variant="neon" t={t} />
            </div>
            {/* front du balayage */}
            {progress > 0.05 && progress < 1 ? (
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  bottom: -40,
                  left: `${reveal - 17.5}%`,
                  width: 6,
                  background: "#fff",
                  transform: "skewX(-38deg)",
                  boxShadow: `0 0 20px ${B.light}, 0 0 50px ${A.base}`,
                }}
              />
            ) : null}
            {/* barre de progression */}
            <div
              style={{
                ...sfont,
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 22,
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: 1 - done,
              }}
            >
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.14)" }}>
                <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 4, background: brandGradient(90), boxShadow: `0 0 12px ${A.light}` }} />
              </div>
              <div style={{ width: 70, textAlign: "right", fontSize: 22, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{Math.round(progress * 100)} %</div>
            </div>
            {/* lecture prête */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 96,
                height: 96,
                marginLeft: -48,
                marginTop: -48,
                borderRadius: 48,
                background: "rgba(10,8,20,0.45)",
                border: "1.5px solid rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${done})`,
                opacity: clamp(done * 2),
              }}
            >
              <IconPlay size={38} />
            </div>
          </div>
          {/* badge */}
          <div
            style={{
              ...sfont,
              position: "absolute",
              right: -26,
              top: -24,
              padding: "12px 22px",
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 800,
              background: brandGradient(),
              boxShadow: glow(A.base, 0.9),
              display: "flex",
              alignItems: "center",
              gap: 10,
              transform: `scale(${Math.max(0, done)})`,
              opacity: clamp(done * 3),
            }}
          >
            <IconSpark size={20} filled /> {SITE.readyLabel}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
