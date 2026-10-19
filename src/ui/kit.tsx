import React from "react";
import { CONFIG } from "../config";
import { accent } from "../lib/utils";

/** Taille logique de l'écran du téléphone (toutes les maquettes sont dessinées à cette taille). */
export const SCREEN_W = 384;
export const SCREEN_H = 824;

export const ui = {
  bg: "#07090E",
  card: "rgba(255,255,255,0.055)",
  cardSolid: "#11141C",
  border: "rgba(255,255,255,0.08)",
  text: "#F5F7FB",
  muted: "#8B93A7",
  faint: "#4A5163",
  success: "#34D399",
  radius: 22,
};

export const font: React.CSSProperties = {
  fontFamily: CONFIG.fontFamily,
  color: ui.text,
  WebkitFontSmoothing: "antialiased",
};

export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  highlight?: boolean;
}> = ({ style, children, highlight }) => (
  <div
    style={{
      ...font,
      position: "relative",
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      borderRadius: ui.radius,
      background: highlight
        ? `linear-gradient(145deg, ${accent.a(0.22)}, rgba(255,255,255,0.04) 70%)`
        : `linear-gradient(160deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03))`,
      border: `1px solid ${highlight ? accent.a(0.45) : ui.border}`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 40px rgba(0,0,0,0.35)",
      backgroundColor: ui.cardSolid,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ───────────── Icônes dessinées en SVG ───────────── */

type IconProps = { size?: number; color?: string; stroke?: number };

export const IconDumbbell: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
  </svg>
);

export const IconTrophy: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
  </svg>
);

export const IconFlame: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.6-6-4-8.2-.6 2-1.6 3-3 3.4.4-3-1-6.2-3.5-8.4C8.3 5.6 5 8.6 5 15.2 5 19.3 8 22 12 22z" />
  </svg>
);

export const IconPlay: React.FC<IconProps> = ({ size = 14, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 16, color = "#fff", stroke = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const IconChevron: React.FC<IconProps> = ({ size = 16, color = "#fff", stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconHome: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconChart: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ size = 22, color = "#fff", stroke = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </svg>
);

/* ───────────── Éléments communs ───────────── */

export const StatusBar: React.FC = () => (
  <div
    style={{
      ...font,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 30px 0 34px",
      fontSize: 15,
      fontWeight: 600,
    }}
  >
    <span>9:41</span>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {/* réseau */}
      <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
      </svg>
      {/* batterie */}
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
        <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="rgba(255,255,255,0.45)" />
        <rect x="2" y="2" width="18" height="9" rx="2" fill="#fff" />
        <rect x="24.5" y="4" width="2" height="5" rx="1" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
  </div>
);

export const ScreenBackground: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(120% 60% at 50% 0%, ${accent.a(0.16)} 0%, transparent 60%), linear-gradient(180deg, #0B0E16 0%, ${ui.bg} 100%)`,
    }}
  />
);

/** Anneau de progression circulaire. */
export const Ring: React.FC<{ size: number; progress: number; stroke?: number; label?: React.ReactNode }> = ({
  size,
  progress,
  stroke = 10,
  label,
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent.light} />
            <stop offset="100%" stopColor={accent.base} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          style={{ filter: `drop-shadow(0 0 6px ${accent.a(0.7)})` }}
        />
      </svg>
      <div
        style={{
          ...font,
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      ...font,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      color: accent.pale,
      background: accent.a(0.16),
      border: `1px solid ${accent.a(0.35)}`,
      ...style,
    }}
  >
    {children}
  </div>
);
