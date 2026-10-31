import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { GU } from "./config";
import { asset, GULogo, Sparkle, Swirls, tee } from "./components";
import { body, display, sticker } from "./GaucheUp";

const C = GU.colors;

/**
 * Miniature TikTok de la vidéo de présentation (1080×1920).
 * Tout l'essentiel tient dans la zone centrale 3:4 (y ≈ 240 → 1680), visible dans la grille du profil.
 */
export const GaucheUpCover: React.FC = () => {
  const shirts = [
    { img: "agt-rouge", r: -11, x: 70, y: 880 },
    { img: "bism-noir", r: 9, x: 630, y: 880 },
    { img: "rep-bleu", r: -2, x: 330, y: 820 },
  ];
  return (
    <AbsoluteFill style={{ background: C.red }}>
      {["logo-mask.png", "logo-outline.png"].map((f) => (
        <Img key={f} src={asset(f)} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      ))}
      <Swirls frame={0} color="#D52F3D" />
      {/* bandeau du haut */}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...body, fontSize: 38, letterSpacing: 6, textTransform: "uppercase", color: C.cream, background: C.ink, padding: "12px 30px", borderRadius: 999, transform: "rotate(-2deg)" }}>
          Streetwear de gauche
        </div>
      </div>
      {/* logo */}
      <div style={{ position: "absolute", left: 90, top: 360 }}>
        <GULogo texture="original" width={900} height={500} />
      </div>
      {/* t-shirts en éventail */}
      {shirts.map((s) => (
        <div
          key={s.img}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: 380,
            height: 380,
            borderRadius: 36,
            overflow: "hidden",
            background: "#fff",
            border: `6px solid ${C.ink}`,
            boxShadow: `0 16px 0 ${C.ink}, 0 30px 50px rgba(0,0,0,0.25)`,
            transform: `rotate(${s.r}deg)`,
          }}
        >
          <Img src={tee(s.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
      {/* pastille -14 % */}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 760,
          width: 270,
          height: 270,
          borderRadius: "50%",
          background: C.cream,
          border: `8px solid ${C.ink}`,
          boxShadow: `0 10px 0 ${C.ink}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(12deg)",
        }}
      >
        <div style={{ ...display, fontSize: 92, color: C.red }}>-14 %</div>
        <div style={{ ...display, fontWeight: 800, fontSize: 34, color: C.ink, marginTop: 4, textAlign: "center", lineHeight: 1 }}>
          spécial
          <br />
          manif
        </div>
      </div>
      {/* accroche */}
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ ...display, fontSize: 168, color: C.cream, textShadow: sticker(C.ink, 12), transform: "rotate(-3deg)" }}>C'est ouvert !</div>
      </div>
      <div style={{ position: "absolute", top: 1545, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ ...display, fontWeight: 800, fontSize: 58, color: C.cream, background: C.ink, padding: "12px 40px 20px", borderRadius: 999, transform: "rotate(2deg)" }}>{GU.url}</div>
      </div>
      {[
        [130, 300, 34],
        [960, 360, 28],
        [110, 1300, 30],
        [980, 1250, 36],
        [540, 1720, 26],
      ].map(([x, y, s], k) => (
        <Sparkle key={k} x={x} y={y} size={s} t={0.5} color={C.cream} />
      ))}
    </AbsoluteFill>
  );
};
