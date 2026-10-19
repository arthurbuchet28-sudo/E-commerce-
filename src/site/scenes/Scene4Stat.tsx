import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { DirectionalBlur } from "../../lib/motionBlur";
import { useScene } from "../../lib/scene";
import { clamp, ease, glow, textGlow } from "../../lib/utils";
import { SITE } from "../config";
import { LightTrail } from "../components/LightTrail";
import { useLayout } from "../layout";
import { A, B, brandGradient, formatInt, sfont, ui } from "../theme";
import { IconAward, IconBook, IconStar, IconUsers } from "../ui/kit";

const RADIUS = 48;
const AVATARS = ["L", "H", "S", "I", "N", "J", "M"];

/** Scène 4 (10-13,5 s) : le chiffre clé s'incrémente sur une grande carte néon. */
export const Scene4Stat: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;
  const { stat } = SITE;
  const { vertical } = useLayout();
  const CARD_W = vertical ? 860 : 1120;
  const CARD_H = vertical ? 980 : 600;

  const enter = spring({ frame: frame + 6, fps, config: { damping: 22, stiffness: 60 } });

  const value = (f: number) => interpolate(f, [12, 117], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const v = value(frame);
  const dv = Math.abs(value(frame) - value(frame - 1));
  const digitBlur = clamp((dv / Math.max(1, stat.value)) * 260, 0, 7);
  const done = spring({ frame: frame - 117, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const pulse = interpolate(frame, [117, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });

  const trailOffset = -interpolate(frame, [-12, 222], [0.05, 1.9], { easing: ease.soft });
  const trailOn = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ry = -4 + Math.sin(t * 0.55) * 4;
  const rx = 6 * (1 - enter) + 4 + Math.sin(t * 0.7) * 1.2;
  const camScale = interpolate(frame, [0, 230], [1, 1.05]);

  const mini = [
    { Icon: IconBook, label: stat.mini[0] },
    { Icon: IconStar, label: stat.mini[1], star: true },
    { Icon: IconAward, label: stat.mini[2] },
  ];

  return (
    <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${A.a(0.2 + 0.12 * done)} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          transformStyle: "preserve-3d",
          transform: `scale(${camScale}) translateZ(${-500 * (1 - enter)}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS,
            border: `2px solid ${A.light}`,
            transform: `scale(${1 + pulse * 0.16})`,
            opacity: pulse > 0 ? (1 - pulse) * 0.8 : 0,
            boxShadow: glow(A.base, 1.2),
          }}
        />
        <div
          style={{
            ...sfont,
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS,
            overflow: "hidden",
            background: "linear-gradient(150deg, rgba(34,28,58,0.96) 0%, rgba(15,12,26,0.97) 60%, rgba(10,9,18,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: `0 60px 120px rgba(0,0,0,0.6), 0 0 ${80 + 60 * done}px ${A.a(0.25 + 0.15 * done)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
            padding: "60px 72px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 90% at 10% 0%, ${A.a(0.2)} 0%, transparent 60%), radial-gradient(50% 60% at 100% 100%, ${B.a(0.1)} 0%, transparent 70%)` }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: A.a(0.22),
                border: `1px solid ${A.a(0.5)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: glow(A.base, 0.6),
              }}
            >
              <IconUsers size={30} color={A.pale} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: A.pale, textShadow: textGlow(A.base, 0.7) }}>
              {stat.eyebrow}
            </div>
          </div>
          <div style={{ position: "relative", height: vertical ? 250 : 200, marginTop: vertical ? 60 : 26 }}>
            <DirectionalBlur x={0} y={digitBlur}>
              <div
                style={{
                  fontSize: vertical ? 220 : 200,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: textGlow(A.base, 0.5 + 0.6 * done),
                  whiteSpace: "nowrap",
                }}
              >
                {formatInt(v)}
                {stat.suffix}
              </div>
            </DirectionalBlur>
          </div>
          <div style={{ position: "relative", fontSize: vertical ? 50 : 40, fontWeight: 600, color: ui.muted, letterSpacing: "-0.02em" }}>{stat.label}</div>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: vertical ? "column" : "row",
              alignItems: vertical ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: vertical ? 44 : 0,
              marginTop: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "flex-start", gap: 14 }}>
              {mini.map(({ Icon, label, star }, i) => {
                const m = spring({ frame: frame - 40 - i * 10, fps, config: { damping: 16, stiffness: 110 } });
                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 20px",
                      borderRadius: 999,
                      fontSize: vertical ? 32 : 22,
                      fontWeight: 700,
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${ui.border}`,
                      opacity: clamp(m * 1.5),
                      transform: `translateY(${(1 - m) * 20}px)`,
                    }}
                  >
                    {label}
                    <Icon size={(star ? 22 : 24) * (vertical ? 1.4 : 1)} color={star ? "#FBBF24" : B.light} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex" }}>
              {AVATARS.map((c, i) => {
                const m = spring({ frame: frame - 60 - i * 4, fps, config: { damping: 14, stiffness: 120 } });
                return (
                  <div
                    key={i}
                    style={{
                      width: vertical ? 72 : 54,
                      height: vertical ? 72 : 54,
                      borderRadius: 36,
                      marginLeft: i ? -16 : 0,
                      border: "3px solid #120F22",
                      background: i % 2 ? `linear-gradient(135deg, ${B.light}, ${A.base})` : brandGradient(),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 800,
                      transform: `scale(${m})`,
                    }}
                  >
                    {c}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <LightTrail width={CARD_W} height={CARD_H} radius={RADIUS} offset={trailOffset} length={0.16} intensity={trailOn} />
        <LightTrail width={CARD_W} height={CARD_H} radius={RADIUS} offset={trailOffset + 0.5} length={0.07} intensity={trailOn * 0.55} />
      </div>
    </AbsoluteFill>
  );
};
