import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease } from "../../lib/utils";
import { LightTrail } from "../../site/components/LightTrail";
import { VICAT } from "../config";
import { PictoFeuille } from "../components/Pictos";
import { WordReveal } from "../components/Reveal";
import { A, trail, ui, vfont } from "../theme";

const DISC = 320;

/** Scène 4 (10,5-14 s) : picto feuille + CO₂ en baisse, puis « DECA » et « REVY ». */
export const Scene4Carbon: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;

  const disc = spring({ frame: frame + 4, fps, config: { damping: 16, stiffness: 80 } });
  const leaf = interpolate(frame, [6, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const badge = spring({ frame: frame - 44, fps, config: { damping: 11, stiffness: 150, mass: 0.7 } });
  // Flèche qui descend en boucle douce (CO₂ en baisse)
  const arrowY = ((frame - 44) / 40) % 1;
  const trailOffset = -interpolate(frame, [-12, 222], [0.1, 1.6], { easing: ease.soft });
  const trailOn = interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const float = Math.sin(t * 1.4) * 6;
  const push = interpolate(frame, [-12, 222], [1, 1.04]);

  const line: React.CSSProperties = { fontSize: 88, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.18 };
  const brand = (w: string) =>
    w === "DECA." || w === "REVY." ? ({ color: A.base } as React.CSSProperties) : undefined;

  return (
    <AbsoluteFill style={{ ...vfont, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 96, transform: `scale(${push})` }}>
        {/* Disque picto */}
        <div
          style={{
            position: "relative",
            width: DISC,
            height: DISC,
            flexShrink: 0,
            transform: `translateY(${float}px) scale(${0.6 + 0.4 * disc})`,
            opacity: clamp(disc * 1.5),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: ui.card,
              border: `1px solid ${ui.border}`,
              boxShadow: `${ui.shadow}, 0 0 80px ${A.a(0.12)}, inset 0 1px 0 #fff`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PictoFeuille size={170} color={A.base} stroke={1.25} draw={leaf} />
          </div>
          <LightTrail width={DISC} height={DISC} radius={DISC / 2} offset={trailOffset} length={0.18} intensity={trailOn} {...trail} />
          {/* Badge CO₂ ↓ */}
          <div
            style={{
              position: "absolute",
              right: -22,
              bottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px 12px 24px",
              borderRadius: 999,
              background: A.base,
              color: "#fff",
              fontSize: 36,
              fontWeight: 800,
              boxShadow: `0 14px 30px ${A.a(0.3)}`,
              transform: `scale(${Math.max(0, badge)})`,
              opacity: clamp(badge * 3),
            }}
          >
            <span>
              CO<span style={{ fontSize: 22, position: "relative", top: 8 }}>2</span>
            </span>
            <div style={{ position: "relative", width: 28, height: 38, overflow: "hidden" }}>
              <svg
                width={28}
                height={38}
                viewBox="0 0 24 32"
                fill="none"
                stroke="#fff"
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: "absolute", top: frame > 44 ? interpolate(arrowY, [0, 1], [-12, 12], { easing: ease.inOut }) : 0, opacity: frame > 44 ? Math.sin(arrowY * Math.PI) * 0.6 + 0.4 : 1 }}
              >
                <path d="M12 4v22M4 18l8 8 8-8" />
              </svg>
            </div>
          </div>
        </div>
        {/* Textes */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {VICAT.carbon.map((l, i) => (
            <WordReveal
              key={i}
              text={l.before + l.brand}
              frame={frame}
              fps={fps}
              from={20 + i * 40}
              stagger={6}
              style={line}
              wordStyle={brand}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
