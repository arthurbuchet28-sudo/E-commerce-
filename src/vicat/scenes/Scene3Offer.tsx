import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease } from "../../lib/utils";
import { VICAT } from "../config";
import { GlowCard, IconTile } from "../components/GlowCard";
import { PictoBatiment } from "../components/Pictos";
import { Wipe } from "../components/Reveal";
import { A, ui } from "../theme";

const CARD_W = 1260;
const CARD_H = 520;
/** Moment où le sous-titre cède la place aux 3 gammes (jamais plus de 2 lignes à l'écran). */
const SWAP = 118;

/** Scène 3 (6,5-10,5 s) : carte 3D « béton prêt à l'emploi », puis les 3 gammes apparaissent. */
export const Scene3Offer: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const t = absFrame / fps;
  const { offer } = VICAT;

  const sub = interpolate(frame, [32, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const subOut = interpolate(frame, [SWAP - 14, SWAP + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.in });
  const tile = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <GlowCard frame={frame} t={t} fps={fps} width={CARD_W} height={CARD_H} pulseAt={SWAP + 30}>
        <div style={{ position: "relative", height: "100%", padding: "70px 84px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <div style={{ transform: `scale(${tile})`, transformOrigin: "left center" }}>
            <IconTile size={92}>
              <PictoBatiment size={56} color={A.base} stroke={1.5} draw={clamp(tile)} />
            </IconTile>
          </div>
          <div style={{ marginTop: 52, fontSize: 92, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, whiteSpace: "nowrap", ...Wipe(frame, 8, 40) }}>
            {offer.title}
          </div>
          <div style={{ position: "relative", height: 90, marginTop: 22 }}>
            {/* Sous-titre */}
            <div
              style={{
                position: "absolute",
                top: 6,
                fontSize: 54,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: ui.muted,
                whiteSpace: "nowrap",
                opacity: sub * (1 - subOut),
                transform: `translateY(${(1 - sub) * 20 - subOut * 24}px)`,
                filter: subOut > 0.01 ? `blur(${subOut * 10}px)` : undefined,
              }}
            >
              {offer.subtitle}
            </div>
            {/* Gammes */}
            <div style={{ position: "absolute", top: 0, display: "flex", gap: 20 }}>
              {offer.ranges.map((r, i) => {
                const m = spring({ frame: frame - SWAP - i * 12, fps, config: { damping: 13, stiffness: 120 } });
                return (
                  <div
                    key={r}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 34px 16px 26px",
                      borderRadius: 999,
                      fontSize: 44,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: A.base,
                      background: A.a(0.07),
                      border: `1.5px solid ${A.a(0.25)}`,
                      opacity: clamp(m * 1.5),
                      transform: `translateY(${(1 - m) * 26}px) scale(${0.85 + 0.15 * m})`,
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: A.base }} />
                    {r}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlowCard>
    </AbsoluteFill>
  );
};
