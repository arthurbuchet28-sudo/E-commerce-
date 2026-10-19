import React from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { DirectionalBlur } from "../../lib/motionBlur";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp } from "../../lib/utils";
import { VICAT } from "../config";
import { PictoCentrale, PictoFormulation, PictoPompe, PictoToupie } from "../components/Pictos";
import { A, blueBright, trail, ui, vfont } from "../theme";

const TILE = 340;
const GAP = 70;
const PICTOS = [PictoFormulation, PictoPompe, PictoCentrale, PictoToupie];

/** Scène 5 (14-17,5 s) : 4 services en perspective, reliés par des lignes de lumière, qui s'allument tour à tour. */
export const Scene5Services: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;
  const n = VICAT.services.length;
  const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * (TILE + GAP));

  // Léger travelling latéral (avec flou de mouvement) puis convergence vers le centre, comme Promptly
  const drift = (f: number) => interpolate(f, [-20, duration + 20], [140, -140], { easing: ease.soft });
  const vx = Math.abs(drift(frame) - drift(frame - 1));
  const converge = interpolate(frame, [duration - 40, duration + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.in });

  // Mise en avant successive : chaque service s'allume l'un après l'autre
  const STEP = 34;
  const active = (i: number) => {
    const s = 34 + i * STEP;
    return interpolate(frame, [s, s + 12, s + STEP + 6, s + STEP + 18], [0, 1, 1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };

  const linkDraw = (i: number) =>
    interpolate(frame, [20 + i * 12, 60 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out }) * (1 - converge);

  const spread = 1 - converge * 0.9;
  const W = 2400;
  const H = 900;

  return (
    <AbsoluteFill>
      <DirectionalBlur x={clamp(vx * 0.9 + converge * 6, 0, 10)} y={converge * 4}>
        <AbsoluteFill style={{ perspective: 2000, perspectiveOrigin: "50% 45%" }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transformStyle: "preserve-3d",
              transform: `scale(${lerp(1, 0.25, converge)}) translateX(${drift(frame) * (1 - converge)}px) rotateX(${8 + Math.sin(t * 0.5) * 1.5}deg) rotateY(${-12 + Math.sin(t * 0.4) * 3}deg)`,
            }}
          >
            {/* Lignes de lumière entre les services */}
            <svg width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} style={{ position: "absolute", left: -W / 2, top: -H / 2, overflow: "visible" }}>
              <defs>
                <filter id="svcBloom" x="-10%" y="-100%" width="120%" height="300%">
                  <feGaussianBlur stdDeviation={7} />
                </filter>
              </defs>
              {Array.from({ length: n + 1 }).map((_, i) => {
                // liens entre voisins + deux liens qui sortent du champ (réseau plus vaste)
                const a = i === 0 ? { x: xs[0] * spread - TILE / 2 - 600, y: 120 } : { x: xs[i - 1] * spread + TILE / 2 + 4, y: -40 };
                const b = i === n ? { x: xs[n - 1] * spread + TILE / 2 + 600, y: -120 } : { x: xs[i] * spread - TILE / 2 - 4, y: 40 };
                const mid = (a.x + b.x) / 2;
                const d = `M${a.x} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
                const dr = linkDraw(i);
                const flow = -(frame / 80 + i * 0.3);
                return (
                  <g key={i} opacity={i === 0 || i === n ? 0.6 : 1}>
                    <path d={d} fill="none" stroke={blueBright} strokeWidth={9} filter="url(#svcBloom)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} opacity={0.45} />
                    <path d={d} fill="none" stroke={A.base} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} />
                    <path d={d} fill="none" stroke={trail.light} strokeWidth={4} pathLength={1} strokeDasharray="0.06 0.3" strokeDashoffset={flow} opacity={dr} strokeLinecap="round" />
                    {Array.from({ length: 3 }).map((__, k) => {
                      const u = ((frame / fps) * (0.5 + random(`s${i}${k}`) * 0.3) + k / 3) % 1;
                      if (u > dr) return null;
                      const p = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u * u * (3 - 2 * u)) };
                      return <circle key={k} cx={p.x} cy={p.y} r={5} fill={A.base} opacity={Math.sin(u * Math.PI)} />;
                    })}
                  </g>
                );
              })}
            </svg>

            {/* Tuiles */}
            {VICAT.services.map((label, i) => {
              const Picto = PICTOS[i];
              const appear = spring({ frame: frame - 4 - i * 9, fps, config: { damping: 18, stiffness: 80 } });
              const on = active(i);
              const draw = interpolate(frame, [10 + i * 9, 50 + i * 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
              const bob = Math.sin(t * 1.3 + i * 1.1) * 8;
              return (
                <div
                  key={label}
                  style={{
                    ...vfont,
                    position: "absolute",
                    left: xs[i] * spread - TILE / 2,
                    top: -TILE / 2 + bob,
                    width: TILE,
                    height: TILE,
                    borderRadius: 40,
                    background: ui.card,
                    border: `${1 + on * 1.5}px solid ${on > 0.05 ? A.a(0.25 + on * 0.6) : ui.border}`,
                    boxShadow: `${ui.shadow}, 0 0 ${on * 70}px ${A.a(on * 0.22)}, inset 0 1px 0 #fff`,
                    transform: `translateZ(${-400 * (1 - appear) + on * 60}px)`,
                    opacity: clamp(appear * 1.5),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 30,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 44,
                      background: on > 0.05 ? A.a(0.08 + on * 0.9) : A.a(0.08),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Picto size={100} color={on > 0.5 ? "#ffffff" : A.base} stroke={1.5} draw={draw} />
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: on > 0.5 ? A.base : ui.text }}>{label}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </DirectionalBlur>
    </AbsoluteFill>
  );
};
