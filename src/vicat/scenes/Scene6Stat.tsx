import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { DirectionalBlur } from "../../lib/motionBlur";
import { useScene } from "../../lib/scene";
import { clamp, ease } from "../../lib/utils";
import { VICAT } from "../config";
import { GlowCard, IconTile } from "../components/GlowCard";
import { PictoRepere } from "../components/Pictos";
import { A, brandGradient, ui } from "../theme";

const CARD_W = 940;
const CARD_H = 520;
const END = 84;

/** Scène 6 (17,5-20 s) : compteur « 200+ implantations en France » (même mécanique que Promptly). */
export const Scene6Stat: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;
  const { stat } = VICAT;

  const value = (f: number) => interpolate(f, [6, END], [0, stat.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const v = value(frame);
  const dv = Math.abs(value(frame) - value(frame - 1));
  const digitBlur = clamp((dv / stat.value) * 260, 0, 7);
  const plus = spring({ frame: frame - END, fps, config: { damping: 10, stiffness: 160, mass: 0.6 } });
  const label = interpolate(frame, [20, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const tile = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <GlowCard frame={frame} t={t} fps={fps} width={CARD_W} height={CARD_H} pulseAt={END}>
        <div style={{ position: "relative", height: "100%", padding: "64px 80px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <div style={{ transform: `scale(${tile})`, transformOrigin: "left center" }}>
            <IconTile size={92}>
              <PictoRepere size={54} color={A.base} stroke={1.6} draw={clamp(tile)} />
            </IconTile>
          </div>
          <div style={{ position: "relative", height: 230, marginTop: 20 }}>
            <DirectionalBlur x={0} y={digitBlur}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  fontSize: 230,
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ background: brandGradient(180), WebkitBackgroundClip: "text", color: "transparent", padding: "0 0.03em 0.06em 0" }}>
                  {Math.round(v)}
                </span>
                <span
                  style={{
                    color: A.base,
                    display: "inline-block",
                    transform: `scale(${Math.max(0, plus)})`,
                    transformOrigin: "30% 60%",
                    opacity: clamp(plus * 3),
                  }}
                >
                  {stat.suffix}
                </span>
              </div>
            </DirectionalBlur>
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 600,
              color: ui.muted,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              opacity: label,
              transform: `translateY(${(1 - label) * 18}px)`,
            }}
          >
            {stat.label}
          </div>
        </div>
      </GlowCard>
    </AbsoluteFill>
  );
};
