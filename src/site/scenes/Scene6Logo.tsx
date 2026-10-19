import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { useScene } from "../../lib/scene";
import { clamp, ease, glow, lerp } from "../../lib/utils";
import { SITE } from "../config";
import { SiteLogoMark } from "../components/SiteLogo";
import { useLayout } from "../layout";
import { A, B, brandGradient, sfont, ui } from "../theme";
import { IconArrow } from "../ui/kit";

const LOGO = 200;
const GAP = 48;
const NAME_SIZE = 168;

const measureName = () => {
  if (typeof document === "undefined") return NAME_SIZE * 0.6 * SITE.siteName.length;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return NAME_SIZE * 0.6 * SITE.siteName.length;
  ctx.font = `800 ${NAME_SIZE}px ${SITE.fontFamily}`;
  // letterSpacing -0.035em
  return ctx.measureText(SITE.siteName).width - NAME_SIZE * 0.035 * SITE.siteName.length;
};

const PARTICLES = 90;

/** Scène 6 (16,5-20 s) : tout converge, le logo se dessine, le nom apparaît, le bouton pop. */
export const Scene6Logo: React.FC = () => {
  const { frame, absFrame, fps } = useScene();
  const { W, H, cx: CX, cy: CY, vertical } = useLayout();
  const t = absFrame / fps;
  const nameW = useMemo(measureName, []);

  // Particules qui convergent vers le centre (traînées = flou de mouvement)
  const conv = (f: number, i: number) => {
    const delay = random(`d-${i}`) * 18;
    return interpolate(f, [-12 + delay, 40 + delay * 0.6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.in,
    });
  };

  const core = interpolate(frame, [30, 52, 110], [0, 1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Logo : tracé lumineux puis remplissage
  const draw = interpolate(frame, [34, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  const fill = interpolate(frame, [92, 116], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const logoIn = spring({ frame: frame - 28, fps, config: { damping: 18, stiffness: 70 } });

  // Glissement du logo pour faire place au nom : vers la gauche (16:9) ou vers le haut (9:16)
  const slide = spring({ frame: frame - 104, fps, config: { damping: 20, stiffness: 70, mass: 1 } });
  const groupW = LOGO + GAP + nameW;
  const logoX = vertical ? 0 : lerp(0, -(groupW / 2 - LOGO / 2), slide);
  const logoY = vertical ? lerp(0, -230, slide) : 0;
  const nameX = vertical ? -nameW / 2 : logoX + LOGO / 2 + GAP;
  const nameY = vertical ? -230 + LOGO / 2 + 20 + NAME_SIZE * 0.62 : 0;
  // En 9:16, slogan / bouton / URL descendent sous le nom
  const vOff = vertical ? 40 : 0;
  const nameReveal = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });
  const tagline = interpolate(frame, [128, 152], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out });

  // Bouton : léger pop (ressort avec dépassement)
  const pop = spring({ frame: frame - 140, fps, config: { damping: 10, stiffness: 150, mass: 0.7 } });
  const shimmer = interpolate(frame, [170, 205], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });

  const breathe = 1 + Math.sin(t * 2.2) * 0.012 * fill;

  return (
    <AbsoluteFill>
      {/* Particules convergentes */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="streakBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3} />
          </filter>
        </defs>
        {Array.from({ length: PARTICLES }).map((_, i) => {
          const a = random(`a-${i}`) * Math.PI * 2;
          const r0 = 700 + random(`r-${i}`) * 700;
          const p = conv(frame, i);
          const pPrev = conv(frame - 3, i);
          if (p <= 0 || p >= 1) return null;
          const r = r0 * (1 - p);
          const rPrev = r0 * (1 - pPrev);
          const cx = CX;
          const cy = CY;
          const x1 = cx + Math.cos(a) * r;
          const y1 = cy + Math.sin(a) * r;
          const x2 = cx + Math.cos(a) * rPrev;
          const y2 = cy + Math.sin(a) * rPrev;
          const w = 1.5 + random(`w-${i}`) * 2.5;
          return (
            <g key={i} opacity={Math.sin(p * Math.PI) * 0.9 + 0.1}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 ? A.base : B.base} strokeWidth={w * 3} strokeLinecap="round" filter="url(#streakBloom)" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 ? A.pale : B.pale} strokeWidth={w} strokeLinecap="round" />
            </g>
          );
        })}
      </svg>

      {/* Cœur lumineux */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.5 * core}) 0%, ${A.a(0.45 * core)} 6%, ${A.a(
            0.12 * core,
          )} 22%, transparent 45%)`,
        }}
      />

      <AbsoluteFill style={{ ...sfont, alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 0, height: 0, transform: `translateY(${vertical ? -40 : -100}px) scale(${breathe})` }}>
          {/* Logo */}
          <div
            style={{
              position: "absolute",
              left: logoX - LOGO / 2,
              top: logoY - LOGO / 2,
              transform: `scale(${(0.7 + 0.3 * logoIn) * (vertical ? 1.2 : 1)})`,
              opacity: clamp(logoIn * 2),
              filter: `drop-shadow(0 0 ${30 * fill}px ${A.a(0.55 * fill)})`,
            }}
          >
            <SiteLogoMark size={LOGO} draw={draw} fill={fill} />
          </div>
          {/* Nom de l'app */}
          <div
            style={{
              position: "absolute",
              left: nameX,
              top: nameY - NAME_SIZE * 0.62,
              width: nameW + 40,
              overflow: "hidden",
              clipPath: `inset(-40px ${(1 - nameReveal) * 100}% -40px 0)`,
            }}
          >
            <div
              style={{
                fontSize: NAME_SIZE,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                transform: `translateX(${(1 - nameReveal) * -60}px)`,
                filter: `${nameReveal < 1 ? `blur(${(1 - nameReveal) * 10}px) ` : ""}drop-shadow(0 0 24px ${A.a(0.35)})`,
                background: `linear-gradient(180deg, #ffffff 30%, ${A.pale} 120%)`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {SITE.siteName}
            </div>
          </div>
          {/* Slogan */}
          <div
            style={{
              position: "absolute",
              left: -600,
              width: 1200,
              top: LOGO / 2 + 46 + vOff,
              textAlign: "center",
              fontSize: vertical ? 44 : 36,
              fontWeight: 500,
              color: ui.muted,
              letterSpacing: -0.4,
              opacity: tagline,
              transform: `translateY(${(1 - tagline) * 16}px)`,
            }}
          >
            {SITE.tagline}
          </div>
          {/* Bouton CTA */}
          <div
            style={{
              position: "absolute",
              left: -600,
              width: 1200,
              top: LOGO / 2 + 128 + vOff,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "26px 54px",
                borderRadius: 999,
                fontSize: vertical ? 40 : 34,
                fontWeight: 800,
                letterSpacing: -0.4,
                color: "#fff",
                background: brandGradient(100),
                boxShadow: `${glow(A.base, 1.1 * pop)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
                transform: `scale(${Math.max(0, pop)})`,
                opacity: clamp(pop * 3),
                overflow: "hidden",
              }}
            >
              {SITE.ctaLabel}
              <IconArrow size={34} stroke={2.6} />
              {/* Reflet qui balaie le bouton */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${shimmer}%`,
                  width: "30%",
                  background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)",
                  transform: "skewX(-20deg)",
                }}
              />
            </div>
          </div>
          {/* URL */}
          <div
            style={{
              position: "absolute",
              left: -600,
              width: 1200,
              top: LOGO / 2 + 250 + vOff,
              textAlign: "center",
              fontSize: vertical ? 30 : 24,
              fontWeight: 600,
              letterSpacing: 1,
              color: ui.faint,
              opacity: interpolate(frame, [158, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {SITE.url}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
