import React, { useId } from "react";
import { random } from "remotion";
import { SITE } from "../config";
import { A, B, brandGradient, sfont, ui } from "../theme";

/** Taille logique d'un écran du site (toutes les maquettes sont dessinées à cette taille). */
export const SCREEN_W = 1280;
export const SCREEN_H = 800;
export const CHROME_H = 44;

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; highlight?: boolean }> = ({
  style,
  children,
  highlight,
}) => (
  <div
    style={{
      ...sfont,
      position: "relative",
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      borderRadius: ui.radius,
      background: highlight
        ? `linear-gradient(145deg, ${A.a(0.24)}, rgba(255,255,255,0.04) 70%)`
        : "linear-gradient(160deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03))",
      backgroundColor: ui.cardSolid,
      border: `1px solid ${highlight ? A.a(0.5) : ui.border}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 40px rgba(0,0,0,0.35)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ───────────── Icônes SVG ───────────── */

type IconProps = { size?: number; color?: string; stroke?: number };
const Svg: React.FC<IconProps & { children: React.ReactNode; fill?: string }> = ({ size = 22, color = "#fff", stroke = 2, children, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconSpark: React.FC<IconProps & { filled?: boolean }> = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? p.color ?? "#fff" : "none"}>
    <path d="M12 3c.6 4.6 2.9 7 8 9-5.1 2-7.4 4.4-8 9-.6-4.6-2.9-7-8-9 5.1-2 7.4-4.4 8-9z" />
  </Svg>
);
export const IconPlay: React.FC<IconProps> = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
  </svg>
);
export const IconStar: React.FC<IconProps> = ({ size = 18, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
  </svg>
);
export const IconBook: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M9 7h6" />
  </Svg>
);
export const IconFilm: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </Svg>
);
export const IconUsers: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.8.7 3 2.5 3.5 5.2" />
  </Svg>
);
export const IconAward: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7" />
  </Svg>
);
export const IconCheck: React.FC<IconProps> = (p) => (
  <Svg {...p} stroke={p.stroke ?? 3}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IconScissors: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.5 7.5L20 18M8.5 16.5L20 6" />
  </Svg>
);
export const IconHeart: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Svg>
);
export const IconArrow: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

/* ───────────── Logo compact (pour la nav) ───────────── */

export const MiniLogo: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: brandGradient(),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 0 16px ${A.a(0.6)}`,
    }}
  >
    <IconPlay size={size * 0.48} />
  </div>
);

/* ───────────── Barre de navigateur ───────────── */

export const BrowserChrome: React.FC<{ title?: string }> = ({ title = SITE.siteName }) => (
  <div
    style={{
      ...sfont,
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      height: CHROME_H,
      background: "rgba(18,16,30,0.98)",
      borderBottom: `1px solid ${ui.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 18px",
      gap: 16,
      zIndex: 3,
    }}
  >
    <div style={{ display: "flex", gap: 8 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
      ))}
    </div>
    <div
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
        fontWeight: 600,
        color: ui.text,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <MiniLogo size={14} /> {title}
    </div>
    <div
      style={{
        flex: 1,
        maxWidth: 460,
        margin: "0 auto",
        height: 26,
        borderRadius: 8,
        background: "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: ui.muted,
        fontWeight: 500,
      }}
    >
      {SITE.url}
    </div>
    <div style={{ width: 120 }} />
  </div>
);

export const SiteBackground: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(70% 60% at 50% 0%, ${A.a(0.22)} 0%, transparent 60%), radial-gradient(40% 40% at 90% 90%, ${B.a(0.1)} 0%, transparent 70%), linear-gradient(180deg, #0D0B19 0%, ${ui.bg} 100%)`,
    }}
  />
);

export const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      ...sfont,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 14px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
      color: A.pale,
      background: A.a(0.16),
      border: `1px solid ${A.a(0.38)}`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ───────────── Vignettes « générées par l'IA » (SVG pur) ───────────── */

export type ThumbVariant = "neon" | "forest" | "city" | "desert";

const PALETTES: Record<ThumbVariant, { sky: [string, string, string]; sun: [string, string] }> = {
  neon: { sky: ["#0B0420", "#3B1270", "#F97316"], sun: ["#FDE68A", "#F472B6"] },
  forest: { sky: ["#03140F", "#0E4D3A", "#A7F3D0"], sun: ["#ECFCCB", "#34D399"] },
  city: { sky: ["#050A1F", "#1E3A8A", "#22D3EE"], sun: ["#E0F2FE", "#60A5FA"] },
  desert: { sky: ["#1A0B05", "#9A3412", "#FDBA74"], sun: ["#FEF3C7", "#FB923C"] },
};

/**
 * Paysage abstrait façon « image générée » : ciel dégradé, soleil rayé, horizon en grille,
 * vague néon et silhouette d'astronaute sur sa planche. `t` (secondes) anime la vague.
 */
export const AIThumb: React.FC<{ variant?: ThumbVariant; t?: number; astronaut?: boolean; style?: React.CSSProperties }> = ({
  variant = "neon",
  t = 0,
  astronaut = variant === "neon",
  style,
}) => {
  const id = "th" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[variant];
  const wave = (yBase: number, amp: number, phase: number) => {
    let d = `M0 ${yBase}`;
    for (let x = 0; x <= 1600; x += 40) {
      d += ` L${x} ${(yBase + Math.sin(x / 140 + phase) * amp + Math.sin(x / 61 + phase * 1.7) * amp * 0.35).toFixed(1)}`;
    }
    return d + " L1600 900 L0 900 Z";
  };
  const bob = Math.sin(t * 2.2) * 8;
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", ...style }}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="55%" stopColor={p.sky[1]} />
          <stop offset="78%" stopColor={p.sky[2]} />
        </linearGradient>
        <linearGradient id={`${id}sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sun[0]} />
          <stop offset="100%" stopColor={p.sun[1]} />
        </linearGradient>
        <linearGradient id={`${id}wave`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={B.base} stopOpacity={0.95} />
          <stop offset="100%" stopColor={A.deep} stopOpacity={1} />
        </linearGradient>
        <clipPath id={`${id}sunClip`}>
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={0} y={260 + i * 34} width={1600} height={34 - Math.min(16, i * 2)} />
          ))}
          <rect x={0} y={0} width={1600} height={262} />
        </clipPath>
        <filter id={`${id}glow`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      <rect width={1600} height={900} fill={`url(#${id}sky)`} />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={random(`${variant}sx${i}`) * 1600}
          cy={random(`${variant}sy${i}`) * 380}
          r={1 + random(`${variant}sr${i}`) * 2}
          fill="#fff"
          opacity={0.3 + 0.5 * random(`${variant}so${i}`)}
        />
      ))}
      <circle cx={800} cy={470} r={230} fill={`url(#${id}sun)`} clipPath={`url(#${id}sunClip)`} />
      <circle cx={800} cy={470} r={260} fill={p.sun[1]} opacity={0.25} filter={`url(#${id}glow)`} />
      {/* horizon en grille */}
      <rect x={0} y={560} width={1600} height={340} fill={p.sky[0]} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={"h" + i} x1={0} x2={1600} y1={560 + Math.pow(i / 8, 2) * 340} y2={560 + Math.pow(i / 8, 2) * 340} stroke={A.light} strokeOpacity={0.35} strokeWidth={2} />
      ))}
      {Array.from({ length: 17 }).map((_, i) => (
        <line key={"v" + i} x1={800 + (i - 8) * 30} y1={560} x2={800 + (i - 8) * 260} y2={900} stroke={A.light} strokeOpacity={0.3} strokeWidth={2} />
      ))}
      {/* vagues néon */}
      <path d={wave(640, 40, t * 1.4)} fill={`url(#${id}wave)`} opacity={0.75} />
      <path d={wave(700, 60, t * 1.9 + 1)} fill={`url(#${id}wave)`} />
      <path d={wave(700, 60, t * 1.9 + 1).split(" L1600 900")[0]} fill="none" stroke={B.pale} strokeWidth={5} filter={`url(#${id}glow)`} />
      <path d={wave(700, 60, t * 1.9 + 1).split(" L1600 900")[0]} fill="none" stroke="#fff" strokeWidth={2.5} />
      {astronaut ? (
        <g transform={`translate(760 ${560 + bob}) rotate(-8)`}>
          {/* planche */}
          <ellipse cx={40} cy={150} rx={150} ry={16} fill="#0B0618" stroke={B.light} strokeWidth={4} />
          {/* jambes */}
          <path d="M10 140 L-10 90 L20 60 M70 140 L80 95 L50 60" stroke="#E9E5F5" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* corps */}
          <rect x={10} y={-10} width={60} height={80} rx={24} fill="#F1EEFA" />
          <rect x={22} y={10} width={36} height={22} rx={6} fill={A.base} />
          {/* bras */}
          <path d="M15 10 L-40 -10 M65 10 L120 30" stroke="#E9E5F5" strokeWidth={18} strokeLinecap="round" fill="none" />
          {/* casque */}
          <circle cx={40} cy={-40} r={38} fill="#F6F4FC" />
          <ellipse cx={46} cy={-40} rx={26} ry={20} fill="#120A2A" />
          <ellipse cx={54} cy={-48} rx={9} ry={5} fill="#fff" opacity={0.7} />
          {/* liseré lumineux */}
          <circle cx={40} cy={-40} r={40} fill="none" stroke={p.sun[1]} strokeWidth={3} opacity={0.8} />
        </g>
      ) : null}
    </svg>
  );
};
