import React from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { DirectionalBlur } from "../../lib/motionBlur";
import { useScene } from "../../lib/scene";
import { clamp, ease, lerp } from "../../lib/utils";
import { SITE } from "../config";
import { FlatBrowser } from "../components/Laptop";
import { useLayout } from "../layout";
import { A, B, sfont, ui } from "../theme";
import { SCREEN_H, SCREEN_W } from "../ui/kit";
import { CommunityScreen, EditorScreen, LessonScreen } from "../ui/Screens";


type Pt = { x: number; y: number };
const bezier = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

/** Scène 5 (13,5-16,5 s) : les écrans du site défilent en perspective, reliés par des lignes de lumière. */
export const Scene5Screens: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const { cx, cy, vertical } = useLayout();
  const t = absFrame / fps;
  // 16:9 : écrans côte à côte, défilement horizontal. 9:16 : écrans empilés, défilement vertical.
  const SCALE = vertical ? 0.66 : 0.42;
  const SPACING = vertical ? 760 : 640;
  const PW = SCREEN_W * SCALE;
  const PH = SCREEN_H * SCALE;

  // Défilement continu du plan (avec flou de mouvement dans le sens du déplacement)
  const travel = vertical ? 700 : 560;
  const scroll = (f: number) =>
    interpolate(f, [-20, duration + 20], [travel, -travel], { easing: ease.soft });
  const vx = Math.abs(scroll(frame) - scroll(frame - 1));

  // Fin de scène : tout se rassemble vers le centre
  const converge = interpolate(frame, [duration - 48, duration + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.in,
  });

  const planeX = scroll(frame) * (1 - converge);
  const spread = [-1, 0, 1].map((k) => k * SPACING * (1 - converge * 0.92));
  const zigzag = (vertical ? [-50, 50, -50] : [40, -30, 40]).map((v) => v * (1 - converge));
  const xs = vertical ? zigzag : spread;
  const ys = vertical ? spread : zigzag;

  const screens = [
    <LessonScreen key="l" t={t} />,
    <EditorScreen key="e" t={t} />,
    <CommunityScreen key="c" />,
  ];

  // Liens lumineux entre écrans voisins (dans le plan des écrans)
  const links = [0, 1].map((i) => {
    if (vertical) {
      // du bord droit d'un écran au bord gauche du suivant, en traversant l'espace entre eux
      const a = { x: xs[i] + PW / 2 + 6, y: ys[i] + PH / 2 - 70 };
      const b = { x: xs[i + 1] - PW / 2 - 6, y: ys[i + 1] - PH / 2 + 70 };
      return { p0: a, p1: { x: a.x + 220, y: a.y + 260 }, p2: { x: b.x - 220, y: b.y - 260 }, p3: b };
    }
    const a = { x: xs[i] + PW / 2 + 6, y: ys[i] - 70 };
    const b = { x: xs[i + 1] - PW / 2 - 6, y: ys[i + 1] + 90 };
    const mid = (a.x + b.x) / 2;
    return { p0: a, p1: { x: mid, y: a.y }, p2: { x: mid, y: b.y }, p3: b };
  });
  // Liens qui partent hors champ, pour suggérer un réseau plus vaste
  if (vertical) {
    links.push(
      { p0: { x: xs[0] - PW / 2 - 6, y: ys[0] - 40 }, p1: { x: xs[0] - PW / 2 - 200, y: ys[0] - 40 }, p2: { x: -200, y: ys[0] - 500 }, p3: { x: -200, y: ys[0] - 900 } },
      { p0: { x: xs[2] + PW / 2 + 6, y: ys[2] + 40 }, p1: { x: xs[2] + PW / 2 + 200, y: ys[2] + 40 }, p2: { x: 200, y: ys[2] + 500 }, p3: { x: 200, y: ys[2] + 900 } },
    );
  } else {
    links.push(
      { p0: { x: xs[0] - PW / 2 - 6, y: ys[0] + 160 }, p1: { x: xs[0] - 420, y: ys[0] + 160 }, p2: { x: xs[0] - 420, y: -300 }, p3: { x: xs[0] - 900, y: -300 } },
      { p0: { x: xs[2] + PW / 2 + 6, y: ys[2] - 180 }, p1: { x: xs[2] + 420, y: ys[2] - 180 }, p2: { x: xs[2] + 420, y: 320 }, p3: { x: xs[2] + 900, y: 320 } },
    );
  }

  const pathOf = (l: (typeof links)[number]) =>
    `M${l.p0.x} ${l.p0.y} C${l.p1.x} ${l.p1.y} ${l.p2.x} ${l.p2.y} ${l.p3.x} ${l.p3.y}`;

  const linkDraw = (i: number) =>
    interpolate(frame, [6 + i * 10, 50 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out }) *
    (1 - converge);

  const svgW = vertical ? 2400 : 3200;
  const svgH = vertical ? 3800 : 1400;

  return (
    <AbsoluteFill>
      <DirectionalBlur
        x={vertical ? converge * 6 : clamp(vx * 0.9 + converge * 6, 0, 10)}
        y={vertical ? clamp(vx * 0.9 + converge * 6, 0, 10) : converge * 6}
      >
        <AbsoluteFill style={{ perspective: 2000, perspectiveOrigin: "50% 45%" }}>
          <div
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              transformStyle: "preserve-3d",
              transform: vertical
                ? `scale(${lerp(1, 0.22, converge)}) translateY(${planeX}px) rotateX(${16 + Math.sin(t * 0.5) * 2}deg) rotateY(${-10 + Math.sin(t * 0.4) * 3}deg)`
                : `scale(${lerp(1, 0.22, converge)}) translateX(${planeX}px) rotateX(${8 + Math.sin(t * 0.5) * 1.5}deg) rotateY(${-24 + Math.sin(t * 0.4) * 3}deg)`,
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
                    <path d={d} fill="none" stroke={A.base} strokeWidth={10} filter="url(#lineBloom)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} opacity={0.8} />
                    <path d={d} fill="none" stroke={A.light} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dr} />
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
                          <circle cx={pt.x} cy={pt.y + jitter} r={r * 2.4} fill={B.base} filter="url(#dotBloom)" />
                          <circle cx={pt.x} cy={pt.y + jitter} r={r * 0.7} fill="#fff" />
                        </g>
                      );
                    })}
                    {/* nœuds aux extrémités */}
                    {[l.p0, l.p3].map((p, k) => (
                      <circle key={k} cx={p.x} cy={p.y} r={7} fill="#fff" opacity={dr} style={{ filter: `drop-shadow(0 0 8px ${B.base}) drop-shadow(0 0 18px ${A.base})` }} />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Écrans */}
            {screens.map((screen, i) => {
              const e = spring({ frame: frame + 10 - i * 7, fps, config: { damping: 20, stiffness: 55, mass: 1 } });
              const float = Math.sin(t * 0.9 + i * 2) * 10;
              const caption = SITE.screens[i];
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: xs[i] - PW / 2,
                    top: ys[i] - PH / 2 + float + (1 - e) * (vertical ? 220 : 140),
                    width: PW,
                    height: PH,
                    opacity: e,
                  }}
                >
                  <div style={{ transform: `scale(${SCALE})`, transformOrigin: "0 0" }}>
                    <FlatBrowser glare={(planeX / 20) - i * 15}>{screen}</FlatBrowser>
                  </div>
                  {caption ? (
                    <div
                      style={{
                        ...sfont,
                        position: "absolute",
                        top: PH + (vertical ? 30 : 36),
                        left: -80,
                        right: -80,
                        textAlign: "center",
                        opacity: interpolate(e, [0.6, 1], [0, 1]) * (1 - converge),
                      }}
                    >
                      <div style={{ fontSize: vertical ? 50 : 34, fontWeight: 800, letterSpacing: -0.8 }}>{caption.title}</div>
                      <div style={{ fontSize: vertical ? 30 : 21, fontWeight: 500, color: ui.muted, marginTop: 6 }}>{caption.subtitle}</div>
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
          background: `radial-gradient(circle at 50% 50%, ${A.a(0.5 * converge)} 0%, transparent ${10 + 25 * converge}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
