import React from "react";
import { A } from "../theme";
import { SCREEN_H, SCREEN_W } from "../ui/kit";
import { SiteLogoMark } from "./SiteLogo";

export const BZ = 22; // bezel latéral et haut
const CHIN = 30;
export const LID_W = SCREEN_W + BZ * 2; // 1324
export const LID_H = SCREEN_H + BZ + CHIN; // 852
const LID_R = 34;
const BASE_W = 1420;
const BASE_D = 900;
const BASE_LAYERS = 14;
const BASE_T = 22;

const alu = (light: number) =>
  `linear-gradient(180deg, rgb(${150 + light * 70}, ${154 + light * 70}, ${166 + light * 70}) 0%, rgb(${92 + light * 50}, ${96 + light * 50}, ${108 + light * 50}) 100%)`;

/** Reflet glissant sur la vitre, qui suit la rotation. */
export const Glare: React.FC<{ shift: number; strength?: number; radius?: number }> = ({ shift, strength = 1, radius = 0 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      pointerEvents: "none",
      background: `linear-gradient(115deg, transparent 0%, transparent 38%, rgba(255,255,255,${0.14 * strength}) 47%, rgba(255,255,255,${0.04 * strength}) 53%, transparent 62%, transparent 100%)`,
      backgroundSize: "300% 100%",
      backgroundPosition: `${50 + shift}% 0%`,
      mixBlendMode: "screen",
      zIndex: 10,
    }}
  />
);

const Keyboard: React.FC = () => {
  const rows = [14, 14, 13, 12, 11];
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 70, display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((n, r) => (
        <div key={r} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {Array.from({ length: n }).map((_, k) => (
            <div
              key={k}
              style={{
                width: r === 4 && k === 5 ? 330 : 74,
                height: 64,
                borderRadius: 10,
                background: "#15161b",
                boxShadow: `inset 0 -2px 0 rgba(255,255,255,0.05), 0 0 6px ${A.a(0.12)}`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * MacBook en CSS 3D. La boîte de référence est le capot (écran) : la rotation se fait
 * autour du centre de l'écran, la base est accrochée sous la charnière.
 */
export const Laptop3D: React.FC<{ rotateY: number; lidTilt: number; baseOpacity?: number; children: React.ReactNode }> = ({
  rotateY,
  lidTilt,
  baseOpacity = 1,
  children,
}) => {
  const light = 0.5 + 0.5 * Math.cos(((rotateY + 30) * Math.PI) / 180);
  return (
    <div style={{ position: "relative", width: LID_W, height: LID_H, transformStyle: "preserve-3d" }}>
      {/* Base */}
      <div
        style={{
          position: "absolute",
          left: (LID_W - BASE_W) / 2,
          top: LID_H,
          width: BASE_W,
          height: BASE_D,
          transformOrigin: "50% 0",
          transform: "rotateX(90deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: BASE_LAYERS }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "14px 14px 40px 40px",
              background: i === 0 ? alu(light) : `rgb(${70 + light * 60}, ${73 + light * 60}, ${82 + light * 60})`,
              transform: `translateZ(${-(BASE_T * i) / (BASE_LAYERS - 1)}px)`,
              overflow: "hidden",
              // l'opacité sur chaque couche (et non sur le parent) préserve la 3D
              opacity: baseOpacity,
            }}
          >
            {i === 0 ? (
              <>
                <Keyboard />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    marginLeft: -270,
                    width: 540,
                    height: 330,
                    bottom: 40,
                    borderRadius: 18,
                    background: "rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.18)",
                  }}
                />
              </>
            ) : null}
          </div>
        ))}
      </div>

      {/* Capot (écran), pivote autour de la charnière */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 100%",
          transform: `rotateX(${lidTilt}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {[1, 3, 5, 7].map((z) => (
          <div key={z} style={{ position: "absolute", inset: 0, borderRadius: LID_R, background: alu(light * 0.8), transform: `translateZ(${-z}px)` }} />
        ))}
        {/* Dos du capot */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: LID_R,
            transform: "translateZ(-8.5px) rotateY(180deg)",
            backfaceVisibility: "hidden",
            background: `linear-gradient(150deg, #c9ccd4 0%, #8e929d 55%, #6b6f79 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <SiteLogoMark size={130} draw={1} fill={1} glowStrength={0.5} />
          <Glare shift={-rotateY * 0.6} strength={1.4} radius={LID_R} />
        </div>
        {/* Face avant : bezel + écran */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: LID_R,
            transform: "translateZ(0.5px)",
            backfaceVisibility: "hidden",
            background: "#050507",
            boxShadow: "inset 0 0 0 2px #50545d",
          }}
        >
          {/* encoche caméra */}
          <div style={{ position: "absolute", top: 0, left: "50%", width: 150, height: 22, marginLeft: -75, borderRadius: "0 0 12px 12px", background: "#000", zIndex: 5 }}>
            <div style={{ position: "absolute", left: 69, top: 7, width: 9, height: 9, borderRadius: 5, background: "#1b2236", boxShadow: "inset 0 0 0 2px #0d1020" }} />
          </div>
          <div
            style={{
              position: "absolute",
              left: BZ,
              top: BZ,
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: 10,
              overflow: "hidden",
              background: "#06050b",
            }}
          >
            {children}
            <Glare shift={-rotateY * 0.9} />
          </div>
          <div style={{ position: "absolute", bottom: 7, left: 0, right: 0, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#6a6e78", fontFamily: "Inter" }}>
            MacBook Pro
          </div>
        </div>
      </div>
    </div>
  );
};

/** Fenêtre de navigateur plate (la barre d'onglets fait partie de l'écran). */
export const FlatBrowser: React.FC<{ children: React.ReactNode; glare?: number }> = ({ children, glare = 0 }) => (
  <div
    style={{
      position: "relative",
      width: SCREEN_W,
      height: SCREEN_H,
      borderRadius: 22,
      overflow: "hidden",
      boxShadow: `0 0 0 1.5px rgba(255,255,255,0.14), 0 50px 110px rgba(0,0,0,0.6), 0 0 80px ${A.a(0.22)}`,
    }}
  >
    {children}
    <Glare shift={glare} />
  </div>
);
