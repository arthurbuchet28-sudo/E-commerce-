import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease } from "../../lib/utils";
import { VICAT } from "../config";
import { Converge, Core } from "../components/Converge";
import { Wipe } from "../components/Reveal";
import { VicatLogo } from "../components/VicatLogo";
import { A, ui, vfont } from "../theme";

const LOGO_W = 860;

/** Scène 1 (0-3 s) : les particules convergent, le logo Vicat se trace en lumière puis se remplit. */
export const Scene1Intro: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const { width: W, height: H } = useVideoConfig();
  const t = absFrame / fps;

  const core = interpolate(frame, [26, 46, 110], [0, 1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const draw = interpolate(frame, [24, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const fill = interpolate(frame, [86, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const logoIn = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 70 } });
  const lift = spring({ frame: frame - 104, fps, config: { damping: 20, stiffness: 70 } });
  const breathe = 1 + Math.sin(t * 2.2) * 0.008 * fill;

  return (
    <AbsoluteFill>
      <Converge frame={frame} W={W} H={H} seed="intro" />
      <Core intensity={core} />
      <AbsoluteFill style={{ ...vfont, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            transform: `translateY(${-lift * 46}px) scale(${(0.72 + 0.28 * logoIn) * breathe})`,
            opacity: clamp(logoIn * 2),
            filter: `drop-shadow(0 18px 40px ${A.a(0.18 * fill)})`,
          }}
        >
          <VicatLogo width={LOGO_W} draw={draw} fill={fill} />
        </div>
        <div
          style={{
            position: "absolute",
            top: H / 2 + 92,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 7,
            textTransform: "uppercase",
            color: ui.muted,
            ...Wipe(frame, 118, 150),
          }}
        >
          {VICAT.introCaption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
