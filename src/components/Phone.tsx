import React from "react";
import { accent } from "../lib/utils";
import { SCREEN_H, SCREEN_W } from "../ui/kit";
import { LogoMark } from "./Logo";

export const BEZEL = 13;
export const PHONE_W = SCREEN_W + BEZEL * 2; // 410
export const PHONE_H = SCREEN_H + BEZEL * 2; // 850
const RADIUS = 66;
const DEPTH = 26;
const EDGE_LAYERS = 14;

/** Reflet glissant sur la vitre, qui se déplace avec la rotation du téléphone. */
const Glare: React.FC<{ shift: number; strength?: number }> = ({ shift, strength = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: RADIUS - BEZEL,
      pointerEvents: "none",
      background: `linear-gradient(115deg, transparent 0%, transparent 38%, rgba(255,255,255,${0.16 * strength}) 47%, rgba(255,255,255,${0.04 * strength}) 53%, transparent 62%, transparent 100%)`,
      backgroundSize: "300% 100%",
      backgroundPosition: `${50 + shift}% 0%`,
      mixBlendMode: "screen",
    }}
  />
);

const DynamicIsland: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 11,
      left: "50%",
      width: 112,
      height: 33,
      marginLeft: -56,
      borderRadius: 20,
      background: "#000",
      zIndex: 5,
    }}
  />
);

/**
 * iPhone en CSS 3D : une pile de couches arrondies forme la tranche en titane,
 * une face avant (vitre + écran) et une face arrière (bloc photo).
 */
export const Phone3D: React.FC<{
  rotateY: number;
  children: React.ReactNode;
}> = ({ rotateY, children }) => {
  // Lumière virtuelle : la tranche s'éclaire selon l'orientation.
  const light = 0.5 + 0.5 * Math.cos(((rotateY + 30) * Math.PI) / 180);
  const edge = `linear-gradient(90deg, #22262e 0%, rgb(${120 + light * 80}, ${126 + light * 80}, ${138 + light * 80}) 50%, #1b1e24 100%)`;
  return (
    <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, transformStyle: "preserve-3d" }}>
      {Array.from({ length: EDGE_LAYERS }).map((_, i) => {
        const z = -DEPTH / 2 + (DEPTH * i) / (EDGE_LAYERS - 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: RADIUS,
              background: edge,
              transform: `translateZ(${z}px)`,
            }}
          />
        );
      })}

      {/* Boutons latéraux */}
      {[
        { top: 170, h: 40, side: "left" },
        { top: 240, h: 70, side: "left" },
        { top: 330, h: 70, side: "left" },
        { top: 260, h: 110, side: "right" },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            [b.side]: -3,
            width: 6,
            height: b.h,
            borderRadius: 3,
            background: "#8a919c",
            transform: "translateZ(0px)",
          }}
        />
      ))}

      {/* Face arrière */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: RADIUS,
          transform: `translateZ(${-DEPTH / 2 - 0.6}px) rotateY(180deg)`,
          backfaceVisibility: "hidden",
          background: "linear-gradient(150deg, #2b3039 0%, #14171c 55%, #0d0f13 100%)",
          boxShadow: "inset 0 0 0 3px #5b616b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 26,
            width: 170,
            height: 170,
            borderRadius: 48,
            background: "linear-gradient(145deg, #3a3f49, #1a1d23)",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.5)",
          }}
        >
          {[
            [18, 18],
            [18, 92],
            [92, 55],
          ].map(([t, l], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: t,
                left: l,
                width: 62,
                height: 62,
                borderRadius: 31,
                background: "radial-gradient(circle at 40% 35%, #3b4f7a 0%, #0a0d14 45%, #000 70%)",
                boxShadow: "0 0 0 5px #2a2e36, 0 0 0 7px #4a505a",
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.9 }}>
          <LogoMark size={92} draw={1} fill={1} glowStrength={0.6} />
        </div>
        <Glare shift={-rotateY * 0.6} strength={0.7} />
      </div>

      {/* Face avant */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: RADIUS,
          transform: `translateZ(${DEPTH / 2 + 0.6}px)`,
          backfaceVisibility: "hidden",
          background: "#000",
          boxShadow: "inset 0 0 0 2.5px #6b727d, inset 0 0 0 5px #0b0c0f",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: BEZEL,
            top: BEZEL,
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: RADIUS - BEZEL,
            overflow: "hidden",
            background: "#05060a",
          }}
        >
          {children}
          <DynamicIsland />
          <Glare shift={-rotateY * 0.9} />
        </div>
      </div>
    </div>
  );
};

/** Téléphone « à plat » (sans épaisseur) pour les écrans en perspective de la scène 4. */
export const FlatPhone: React.FC<{ children: React.ReactNode; glare?: number }> = ({ children, glare = 0 }) => (
  <div
    style={{
      position: "relative",
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: RADIUS,
      background: "#000",
      boxShadow: `inset 0 0 0 2.5px #7a818c, inset 0 0 0 5px #0b0c0f, 0 40px 90px rgba(0,0,0,0.6), 0 0 60px ${accent.a(0.18)}`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: BEZEL,
        top: BEZEL,
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: RADIUS - BEZEL,
        overflow: "hidden",
      }}
    >
      {children}
      <DynamicIsland />
      <Glare shift={glare} />
    </div>
  </div>
);
