import React from "react";
import { random } from "remotion";
import { BOOST } from "../config";
import { bfont, flame, formatViews, ui } from "../theme";
import { Comment, Eye, Heart, Share } from "./icons";

/** Vignette « assiette de pâtes » stylisée, en SVG pur. */
export const FoodThumb: React.FC<{ t?: number; w?: number; h?: number }> = ({ t = 0, w = 384, h = 824 }) => (
  <svg viewBox="0 0 384 824" width={w} height={h} preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <defs>
      <radialGradient id="ftBg" cx="0.5" cy="0.45" r="0.8">
        <stop offset="0%" stopColor="#3a2418" />
        <stop offset="70%" stopColor="#140c09" />
      </radialGradient>
      <radialGradient id="ftPlate" cx="0.45" cy="0.4" r="0.6">
        <stop offset="0%" stopColor="#f4efe9" />
        <stop offset="100%" stopColor="#bdb5ad" />
      </radialGradient>
      <radialGradient id="ftSauce" cx="0.5" cy="0.45" r="0.55">
        <stop offset="0%" stopColor="#ffe3a3" />
        <stop offset="100%" stopColor="#e6a85a" />
      </radialGradient>
    </defs>
    <rect width={384} height={824} fill="url(#ftBg)" />
    {/* planche */}
    <rect x={-40} y={540} width={470} height={320} rx={30} fill="#5b3a22" transform="rotate(-6 192 680)" />
    <ellipse cx={192} cy={400} rx={170} ry={150} fill="#000" opacity={0.35} />
    <ellipse cx={192} cy={390} rx={168} ry={146} fill="url(#ftPlate)" />
    <ellipse cx={192} cy={390} rx={128} ry={110} fill="#e9e3dc" />
    {/* pâtes : spirales de traits */}
    <ellipse cx={192} cy={392} rx={100} ry={84} fill="url(#ftSauce)" />
    {Array.from({ length: 26 }).map((_, i) => {
      const a = random(`p${i}`) * Math.PI * 2;
      const r = 20 + random(`r${i}`) * 60;
      const x = 192 + Math.cos(a) * r;
      const y = 392 + Math.sin(a) * r * 0.82;
      return (
        <path
          key={i}
          d={`M${x - 26} ${y} C${x - 10} ${y - 18} ${x + 10} ${y + 18} ${x + 26} ${y}`}
          stroke="#fff3d1"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          opacity={0.75}
          transform={`rotate(${random(`o${i}`) * 180} ${x} ${y})`}
        />
      );
    })}
    {/* basilic + parmesan */}
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={160 + i * 34} cy={360 + (i % 2) * 30} rx={16} ry={8} fill="#3f8a3c" transform={`rotate(${i * 50 - 30} ${160 + i * 34} ${360 + (i % 2) * 30})`} />
    ))}
    {Array.from({ length: 30 }).map((_, i) => (
      <circle key={i} cx={130 + random(`c${i}`) * 124} cy={340 + random(`d${i}`) * 110} r={2} fill="#fff8e8" opacity={0.8} />
    ))}
    {/* vapeur */}
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${150 + i * 42} 250 C${140 + i * 42} ${220 - Math.sin(t * 2 + i) * 10} ${170 + i * 42} 200 ${158 + i * 42} 160`}
        stroke="#fff"
        strokeWidth={5}
        opacity={0.12}
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

/** Fil de vidéos verticales générique (aucun logo de marque). */
export const FeedScreen: React.FC<{ views: number; t?: number; viewsOpacity?: number }> = ({ views, t = 0, viewsOpacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
    <FoodThumb t={t} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 22%, transparent 62%, rgba(0,0,0,0.75) 100%)" }} />
    {/* onglets */}
    <div style={{ ...bfont, position: "absolute", top: 58, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, fontSize: 16 }}>
      <span style={{ color: ui.muted }}>Abonnements</span>
      <span style={{ fontWeight: 800, borderBottom: "2px solid #fff", paddingBottom: 4 }}>Pour toi</span>
    </div>
    {/* compteur de vues */}
    <div
      style={{
        ...bfont,
        position: "absolute",
        top: 100,
        left: 18,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.45)",
        fontSize: 20,
        fontWeight: 800,
        opacity: viewsOpacity,
      }}
    >
      <Eye size={20} color="#fff" /> {formatViews(views)}
    </div>
    {/* colonne d'actions */}
    <div style={{ ...bfont, position: "absolute", right: 14, top: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontSize: 13, fontWeight: 800 }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, background: flame(), border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        {BOOST.accountName[0]}
      </div>
      {[
        { I: Heart, n: "12" },
        { I: Comment, n: "1" },
        { I: Share, n: "0" },
      ].map(({ I, n }, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <I size={34} color="#fff" fill={i === 0} />
          {n}
        </div>
      ))}
    </div>
    {/* légende */}
    <div style={{ ...bfont, position: "absolute", left: 18, right: 90, bottom: 56 }}>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{BOOST.account}</div>
      <div style={{ fontSize: 15, marginTop: 6, color: "#e9e4e0" }}>{BOOST.videoCaption}</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, height: 3, background: "rgba(255,255,255,0.2)" }}>
      <div style={{ width: `${30 + ((t * 12) % 60)}%`, height: "100%", background: "#fff" }} />
    </div>
  </div>
);
