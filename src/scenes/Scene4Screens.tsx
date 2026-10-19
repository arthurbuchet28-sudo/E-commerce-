import React from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { CONFIG } from "../config";
import { FlatPhone, PHONE_H, PHONE_W } from "../components/Phone";
import { DirectionalBlur } from "../lib/motionBlur";
import { useScene } from "../lib/scene";
import { accent, clamp, ease, lerp } from "../lib/utils";
import { font, ui } from "../ui/kit";
import { ProgressScreen, StreakScreen, WorkoutScreen } from "../ui/OtherScreens";

const SCALE = 0.74;
const SPACING = 600;
const PW = PHONE_W * SCALE;
const PH = PHONE_H * SCALE;

type Pt = { x: number; y: number };
const bezier = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

/** Scène 4 (9-12 s) : les écrans de l'app défilent en perspective, reliés par des lignes de lumière. */
export const Scene4Screens: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;

  // Défilement latéral continu du plan (avec flou de mouvement horizontal)
  const scroll = (f: number) =>
    interpolate(f, [-20, duration + 20], [560, -560], { easing: ease.soft });
  const vx = Math.abs(scroll(frame) - scroll(frame - 1));

  // Fin de scène : tout se rassemble vers le centre
  const converge = interpolate(frame, [duration - 48, duration + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.in,
  });

  const planeX = scroll(frame) * (1 - converge);
  const xs = [-1, 0, 1].map((k) => k * SPACING * (1 - converge * 0.92));
  const ys = [40, -30, 40].map((y) => y * (1 - converge));

  const screens = [
    <WorkoutScreen key="w" t={t} />,
    <ProgressScreen key="p" draw={interpolate(frame, [20, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut })} />,
    <StreakScreen key="s" />,
  ];

  // Liens lumineux entre écrans voisins (dans le plan des écrans)
  const links = [0, 1].map((i) => {
    const a = { x: xs[i] + PW / 2 + 6, y: ys[i] - 120 };
    const b = { x: xs[i + 1] - PW / 2 - 6, y: ys[i + 1] + 140 };
    const mid = (a.x + b.x) / 2;
    return { p0: a, p1: { x: mid, y: a.y }, p2: { x: mid, y: b.y }, p3: b };
  });
  // Liens qui partent hors champ, pour suggérer un réseau plus vaste
  links.push(
    { p0: { x: xs[0] - PW / 2 - 6, y: ys[0] + 160 }, p1: { x: xs[0] - 420, y: ys[0] + 160 }, p2: { x: xs[0] - 420, y: -300 }, p3: { x: xs[0] - 900, y: -300 } },
    { p0: { x: xs[2] + PW / 2 + 6, y: ys[2] - 180 }, p1: { x: xs[2] + 420, y: ys[2] - 180 }, p2: { x: xs[2] + 420, y: 320 }, p3: { x: xs[2] + 900, y: 320 } },
  );

  const pathOf = (l: (typeof links)[number]) =>
    `M${l.p0.x} ${l.p0.y} C${l.p1.x} ${l.p1.y} ${l.p2.x} ${l.p2.y} ${l.p3.x} ${l.p3.y}`;

  const linkDraw = (i: number) =>
    interpolate(frame, [6 + i * 10, 50 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out }) *
    (1 - converge);

  const svgW = 3200;
  const svgH = 1400;

  return (
    <AbsoluteFill>
      <DirectionalBlur x={clamp(vx * 0.9 + converge * 6, 0, 10)} y={converge * 6}>
        <AbsoluteFill style={{ perspective: 2000, perspectiveOrigin: "50% 45%" }}>
          <div
            style={{
              position: "absolute",
              left: 960,
              top: 540,
              transformStyle: "preserve-3d",
              transform: `scale(${lerp(1, 0.22, converge)}) translateX(${planeX}px) rotateX(${8 + Math.sin(t * 0.5) * 1.5}deg) rotateY(${-24 + Math.sin(t * 0.4) * 3}deg)`,
            }}
          >
            {/* Lignes de lumière + particules */}
            <svg
              width={svgW}
              height={svgH}
              viewBox={`${-svgW / 2} ${-svgH / 2} ${svgW} ${svgH}`}
              style={{ position: "absolute", left: -svgW / 2, top: -svgH / 2, overflow: "visible" }}
            >
              <defs>
                <filter id="lineBloom" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation={9} />
                </filter>
                <filter id="dotBloom" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation={5} />
                </filter>
              </defs>
              {links.map((l, i) => {
                const dr = linkDraw(i);
                const d = pathOf(l);
                const flow = -(frame / 90 + i * 0.3);
                return (
                  <g key={i}>
                    <path d={d} fill="none" stroke={accent.base} strokeWidth={10} filter="url(#lineBloom)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} opacity={0.8} />
                    <path d={d} fill="none" stroke={accent.light} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} />
                    {/* impulsions qui circulent le long de la ligne */}
                    <path d={d} fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray="0.05 0.28" strokeDashoffset={flow} opacity={dr} strokeLinecap="round" />
                    {Array.from({ length: 7 }).map((_, k) => {
                      const speed = 0.45 + random(`sp-${i}-${k}`) * 0.4;
                      const u = (((frame / fps) * speed + k / 7 + random(`ph-${i}-${k}`)) % 1 + 1) % 1;
                      if (u > dr) return null;
                      const pt = bezier(l.p0, l.p1, l.p2, l.p3, u);
                      const jitter = (random(`j-${i}-${k}`) - 0.5) * 18;
                      const fade = Math.sin(u * Math.PI);
                      const r = 3 + random(`r-${i}-${k}`) * 3;
                      return (
                        <g key={k} opacity={fade}>
                          <circle cx={pt.x} cy={pt.y + jitter} r={r * 2.4} fill={accent.base} filter="url(#dotBloom)" />
                          <circle cx={pt.x} cy={pt.y + jitter} r={r * 0.7} fill="#fff" />
                        </g>
                      );
                    })}
                    {/* nœuds aux extrémités */}
                    {[l.p0, l.p3].map((p, k) => (
                      <circle key={k} cx={p.x} cy={p.y} r={7} fill="#fff" opacity={dr} style={{ filter: `drop-shadow(0 0 8px ${accent.base}) drop-shadow(0 0 18px ${accent.base})` }} />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Écrans */}
            {screens.map((screen, i) => {
              const e = spring({ frame: frame + 10 - i * 7, fps, config: { damping: 20, stiffness: 55, mass: 1 } });
              const float = Math.sin(t * 0.9 + i * 2) * 10;
              const caption = CONFIG.screens[i];
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: xs[i] - PW / 2,
                    top: ys[i] - PH / 2 + float + (1 - e) * 140,
                    width: PW,
                    height: PH,
                    opacity: e,
                  }}
                >
                  <div style={{ transform: `scale(${SCALE})`, transformOrigin: "0 0" }}>
                    <FlatPhone glare={(planeX / 20) - i * 15}>{screen}</FlatPhone>
                  </div>
                  {caption ? (
                    <div
                      style={{
                        ...font,
                        position: "absolute",
                        top: PH + 36,
                        left: -80,
                        right: -80,
                        textAlign: "center",
                        opacity: interpolate(e, [0.6, 1], [0, 1]) * (1 - converge),
                      }}
                    >
                      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.8 }}>{caption.title}</div>
                      <div style={{ fontSize: 21, fontWeight: 500, color: ui.muted, marginTop: 6 }}>{caption.subtitle}</div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </DirectionalBlur>
      {/* Point de convergence lumineux */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent.a(0.5 * converge)} 0%, transparent ${10 + 25 * converge}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
