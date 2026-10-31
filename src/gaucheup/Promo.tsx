import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { Grain } from "../components/Background";
import { useScene } from "../lib/scene";
import { SceneDef, SceneTimeline } from "../lib/timeline";
import { clamp, ease, lerp, rgba } from "../lib/utils";
import { BEAT, GU, GUP, GUP_FRAMES as F, GUP_TEES, GUP_TOTAL_FRAMES } from "./config";
import { asset, GULogo, HALF, Pushed, SparkBurst, Sparkle, Swirls, tee } from "./components";
import { body, display, Hook, LogoSlam, popIn, PromoPrice, sticker, TeeScene } from "./GaucheUp";

const C = GU.colors;
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ───────────── 3. Le vrai site, sur un téléphone qui défile en rythme ───────────── */

const PHONE = { x: 220, y: 380, w: 640, h: 1270, bezel: 18, r: 92 };
const SCREEN_W = PHONE.w - PHONE.bezel * 2;
const SCREEN_H = PHONE.h - PHONE.bezel * 2;
const SHOT_SCALE = SCREEN_W / 975; // la capture fait 975 px de large

const SitePhone: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const steps = GUP.site.steps;
  // défilement par paliers, sur les temps pairs (2, 4, 6)
  const scrollAt = (f: number) => {
    let y: number = steps[0];
    for (let k = 1; k < steps.length; k++) {
      const p = interpolate(f, [k * 2 * BEAT - 6, k * 2 * BEAT + 10], [0, 1], { ...clampOpt, easing: ease.inOut });
      y = lerp(y, steps[k], p);
    }
    return y;
  };
  const sy = scrollAt(frame);
  const phoneIn = popIn(frame, -HALF, fps, 13);
  const title = popIn(frame, 0, fps, 12);
  const url = popIn(frame, 10, fps, 9);
  // « tap » sur « Voir la collection » (temps 1), puis un tap à chaque défilement
  const taps = [BEAT, 2 * BEAT - 8, 4 * BEAT - 8, 6 * BEAT - 8];
  return (
    <Pushed frame={frame} dur={duration}>
      <AbsoluteFill style={{ background: C.cream }}>
        <Swirls frame={frame + 200} color={C.beige} />
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ ...display, fontSize: 96, color: C.ink, opacity: clamp(title * 2), transform: `translateY(${(1 - title) * 30}px)` }}>{GUP.site.title}</div>
          <div style={{ ...display, fontWeight: 800, fontSize: 76, color: C.cream, background: C.red, padding: "12px 44px 22px", borderRadius: 999, border: `6px solid ${C.ink}`, transform: `rotate(-3deg) scale(${Math.max(0, url)})` }}>
            {GU.url}
          </div>
        </div>
        {/* téléphone */}
        <div
          style={{
            position: "absolute",
            left: PHONE.x,
            top: PHONE.y,
            width: PHONE.w,
            height: PHONE.h,
            borderRadius: PHONE.r,
            background: C.ink,
            boxShadow: `0 50px 90px rgba(17,17,17,0.28), inset 0 0 0 3px #3a3a3a`,
            transform: `translateY(${(1 - phoneIn) * 500}px) rotate(${(1 - phoneIn) * -8 + Math.sin(frame / 30) * 0.8}deg)`,
          }}
        >
          <div style={{ position: "absolute", left: PHONE.bezel, top: PHONE.bezel, width: SCREEN_W, height: SCREEN_H, borderRadius: PHONE.r - PHONE.bezel, overflow: "hidden", background: C.cream }}>
            <Img src={asset("site/home.jpg")} style={{ position: "absolute", left: 0, top: -sy * SHOT_SCALE, width: SCREEN_W }} />
            {/* ripples de tap */}
            {taps.map((at, k) => {
              const a = (frame - at) / 18;
              if (a < 0 || a > 1) return null;
              const x = k === 0 ? GUP.site.tap.x * SHOT_SCALE : SCREEN_W * 0.5;
              const y = k === 0 ? (GUP.site.tap.y - sy) * SHOT_SCALE : SCREEN_H * 0.72;
              return (
                <div key={k} style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, background: rgba(C.ink, 0.25 * (1 - a)), border: `4px solid ${rgba(C.ink, 0.6 * (1 - a))}`, transform: `scale(${0.3 + a})` }} />
              );
            })}
          </div>
          {/* île de l'appareil photo */}
          <div style={{ position: "absolute", left: PHONE.w / 2 - 80, top: 34, width: 160, height: 44, borderRadius: 22, background: "#000" }} />
        </div>
        {/* annotations ludiques qui pop à chaque palier */}
        {GUP.site.notes.map((n, k) => {
          const at = (k + 1) * 2 * BEAT + 6;
          const p = popIn(frame, at, fps, 9);
          const out = k < 2 ? clamp((frame - at - 2 * BEAT + 6) / 6) : 0;
          if (p <= 0.01 || out >= 1) return null;
          const left = k % 2 === 0;
          return (
            <div
              key={n}
              style={{
                position: "absolute",
                top: [700, 980, 1180][k],
                [left ? "left" : "right"]: 24,
                ...display,
                fontWeight: 800,
                fontSize: 66,
                color: k === 1 ? C.cream : C.ink,
                background: k === 1 ? C.red : C.cream,
                padding: "12px 28px 18px",
                borderRadius: 999,
                border: `5px solid ${C.ink}`,
                boxShadow: `0 8px 0 ${C.ink}`,
                transform: `rotate(${left ? -8 : 7}deg) scale(${Math.max(0, p) * (1 - out)})`,
              }}
            >
              {n}
            </div>
          );
        })}
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── 4. Les t-shirts (avec le prix promo) ───────────── */

const promoTees = Array.from({ length: GUP_TEES }).map((_, i) => {
  const Comp: React.FC = () => <TeeScene i={i} promo={GUP.promo.tee} />;
  return Comp;
});

/* ───────────── 5. L'édition limitée : sombre, en feu ───────────── */

const Limited: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const stamp = spring({ frame: frame - 2, fps, config: { damping: 8, stiffness: 160, mass: 0.8 } });
  const nameP = popIn(frame, 12, fps, 13);
  const idx = frame >= 2 * BEAT - 2 ? 1 : 0;
  const swapP = idx === 0 ? 1 : clamp((frame - 2 * BEAT + 4) / 6);
  const bump = idx === 0 ? 0 : 1 - spring({ frame: frame - 2 * BEAT + 2, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } });
  const cap = popIn(frame, BEAT + 8, fps, 13);
  const views = GUP.limited.views;
  return (
    <Pushed frame={frame} dur={duration}>
      <AbsoluteFill style={{ background: "#120C0A" }}>
        {/* lueur de feu + braises */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 45% at 50% 100%, rgba(255,120,30,${0.55 + 0.1 * Math.sin(frame / 5)}) 0%, rgba(230,57,70,0.35) 35%, transparent 70%)` }} />
        {Array.from({ length: 40 }).map((_, k) => {
          const sp = 3 + random(`em${k}`) * 6;
          const y = 1920 - ((frame * sp + random(`ey${k}`) * 1920) % 1920);
          const x = random(`ex${k}`) * 1080 + Math.sin(frame / 12 + k) * 20;
          const s = 3 + random(`es${k}`) * 6;
          return <div key={k} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: k % 3 ? "#FFB347" : "#FF5A36", boxShadow: "0 0 10px #FF7A30", opacity: 0.4 + 0.6 * (y / 1920) }} />;
        })}
        {/* tampon ÉDITION LIMITÉE */}
        <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              ...display,
              fontSize: 96,
              color: C.red,
              border: `9px solid ${C.red}`,
              borderRadius: 26,
              padding: "10px 40px 24px",
              textTransform: "uppercase",
              transform: `rotate(-7deg) scale(${lerp(2.4, 1, stamp)})`,
              opacity: clamp(stamp * 3),
              textShadow: "0 0 30px rgba(230,57,70,0.6)",
              boxShadow: "0 0 40px rgba(230,57,70,0.35)",
            }}
          >
            {GUP.limited.stamp}
          </div>
        </div>
        <div style={{ position: "absolute", top: 365, left: 60, right: 60, textAlign: "center", ...display, fontSize: 66, color: C.cream, opacity: clamp(nameP * 2), transform: `translateY(${(1 - nameP) * 24}px)` }}>
          {GUP.limited.name}
        </div>
        {/* carte du t-shirt */}
        <div
          style={{
            position: "absolute",
            left: 130,
            top: 560,
            width: 820,
            height: 820,
            borderRadius: 48,
            overflow: "hidden",
            background: "#fff",
            boxShadow: `0 0 0 6px ${C.cream}, 0 0 80px rgba(255,110,40,0.45)`,
            transform: `scale(${1 + 0.05 * bump}) rotate(${-1.5 * bump}deg)`,
          }}
        >
          <Img src={tee(views[0])} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <Img src={tee(views[idx])} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: swapP }} />
        </div>
        <PromoPrice frame={frame} fps={fps} top={500} promo={GUP.promo.limited} />
        {/* coloris */}
        <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
          {[C.black, C.pink].map((c, k) => (
            <div key={k} style={{ width: 58, height: 58, borderRadius: 29, background: c, border: `4px solid ${C.cream}`, boxShadow: k === idx ? `0 0 0 6px ${C.red}` : undefined, transform: `scale(${k === idx ? 1.12 : 0.9})` }} />
          ))}
        </div>
        <div style={{ position: "absolute", top: 1515, left: 0, right: 0, textAlign: "center", ...display, fontWeight: 800, fontSize: 60, color: C.cream, opacity: clamp(cap * 2), transform: `translateY(${(1 - cap) * 20}px)` }}>
          {GUP.limited.caption}
        </div>
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── 6. Promo spéciale manif : Ernesto et le cortège de pancartes ───────────── */

const Placard: React.FC<{ w: number; h: number; children: React.ReactNode; stick?: number; style?: React.CSSProperties }> = ({ w, h, children, stick = 260, style }) => (
  <div style={{ position: "absolute", width: w, height: h + stick, ...style }}>
    <div style={{ position: "absolute", left: w / 2 - 12, top: h - 20, width: 24, height: stick + 20, background: "linear-gradient(90deg, #7A5230, #A87A4E, #6B4527)", borderRadius: 6 }} />
    <div
      style={{
        position: "absolute",
        inset: `0 0 ${stick}px 0`,
        background: "linear-gradient(160deg, #D9B27A 0%, #C89A5E 60%, #B88A50 100%)",
        borderRadius: 10,
        border: "4px solid #8C6438",
        boxShadow: "0 18px 30px rgba(0,0,0,0.3), inset 0 0 30px rgba(120,80,30,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  </div>
);

const Manif: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const ern = spring({ frame: frame - 4, fps, config: { damping: 10, stiffness: 120, mass: 0.9 } });
  const sign = popIn(frame, 0, fps, 9);
  // la pancarte se retourne sur le 2e temps fort : « -14 % »
  const flip = interpolate(frame, [1.5 * BEAT - 6, 1.5 * BEAT + 6], [0, 180], { ...clampOpt, easing: ease.inOut });
  const front = flip < 90;
  const until = popIn(frame, 2 * BEAT, fps, 9);
  const bob = Math.sin(frame / 6) * 6;
  return (
    <Pushed frame={frame} dur={duration}>
      <AbsoluteFill style={{ background: C.red }}>
        <Swirls frame={frame + 400} color="#D52F3D" />
        {/* cortège de pancartes qui défile… vers la gauche */}
        {GUP.manif.crowd.map((txt, k) => {
          const depth = 0.55 + (k % 3) * 0.15;
          const speed = 5 + (k % 3) * 2.2;
          const x = ((k * 330 - frame * speed) % 2600 + 2600) % 2600 - 500;
          const y = 980 + (k % 3) * 90 + Math.sin(frame / 7 + k) * 12;
          return (
            <Placard key={k} w={300 * depth} h={180 * depth} stick={360 * depth} style={{ left: x, top: y, transform: `rotate(${Math.sin(frame / 9 + k) * 6}deg)`, filter: `blur(${(1 - depth) * 3}px)`, opacity: 0.9 }}>
              <div style={{ ...display, fontSize: (txt.length > 9 ? 30 : 56) * depth, color: C.red, padding: "0 10px", lineHeight: 1 }}>{txt}</div>
            </Placard>
          );
        })}
        {/* Ernesto + sa pancarte */}
        <div style={{ position: "absolute", left: 540 - 255, top: 1920 - 720 * ern + 30 + bob * 0.5, width: 510 }}>
          <Img src={asset("ernesto-beret.png")} style={{ width: 510, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.35))" }} />
        </div>
        <div style={{ position: "absolute", left: 540 - 420, top: 230 + bob, perspective: 1600, transform: `scale(${Math.max(0, sign)}) rotate(${-4 + Math.sin(frame / 8) * 2}deg)` }}>
          <div style={{ position: "relative", width: 840, height: 1020, transform: `rotateY(${flip}deg)`, transformOrigin: "50% 50%" }}>
            <Placard w={840} h={500} stick={520}>
              <div style={{ transform: front ? undefined : "scaleX(-1)" }}>
                {front ? (
                  <>
                    <div style={{ ...display, fontSize: 108, color: C.red }}>{GUP.manif.sign[0]}</div>
                    <div style={{ ...display, fontSize: 92, color: C.ink, marginTop: 6 }}>{GUP.manif.sign[1]}</div>
                  </>
                ) : (
                  <>
                    <div style={{ ...display, fontSize: 210, color: C.red, textShadow: sticker(C.ink, 6) }}>{GUP.manif.signBack}</div>
                    <div style={{ ...display, fontWeight: 800, fontSize: 56, color: C.ink, marginTop: 8 }}>{GUP.manif.signBackSub}</div>
                  </>
                )}
              </div>
            </Placard>
          </div>
        </div>
        {/* bandeau « jusqu'au 30 novembre » */}
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...body, fontSize: 44, letterSpacing: 2, color: C.cream, background: C.ink, padding: "14px 34px", borderRadius: 12, transform: `rotate(3deg) scale(${Math.max(0, until)})`, boxShadow: "0 10px 0 rgba(0,0,0,0.25)" }}>
            {GUP.promo.until}
          </div>
        </div>
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── 7. Fin : retrouve nos t-shirts sur gaucheup.fr · lien dans la bio ───────────── */

const EndPromo: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;
  const textures = GUP.end.textures;
  const idx = Math.max(0, Math.min(textures.length - 1, Math.floor(frame / BEAT)));
  const age = frame - idx * BEAT;
  const pop = spring({ frame: age, fps, config: { damping: 9, stiffness: 190, mass: 0.6 } });
  const scale = idx === 0 ? pop : 1 + 0.12 * (1 - pop);
  const ring = clamp(age / 16);
  const sinceBeat = frame - Math.floor(frame / BEAT) * BEAT;
  const beatBounce = frame > BEAT ? 1 + 0.03 * Math.exp(-sinceBeat / 5) : 1;
  const l1 = popIn(frame, 8, fps, 10);
  const l2 = popIn(frame, 22, fps, 11);
  const url = popIn(frame, 2 * BEAT - 4, fps, 9);
  const hint = popIn(frame, 3 * BEAT, fps, 9);
  const shimmer = ((frame - 2 * BEAT) % (2 * BEAT)) / (2 * BEAT);
  const arrow = Math.abs(Math.sin(frame / 7)) * 14;
  const LOGO_CY = 500;
  return (
    <Pushed frame={frame} dur={duration} last>
      <AbsoluteFill style={{ background: C.red }}>
        <Swirls frame={frame} color="#D52F3D" />
        {ring < 1 ? (
          <div style={{ position: "absolute", left: 540 - 400, top: LOGO_CY - 400, width: 800, height: 800, borderRadius: "50%", border: `10px solid ${C.cream}`, opacity: (1 - ring) * 0.55, transform: `scale(${0.6 + ring * 0.7})` }} />
        ) : null}
        <div style={{ position: "absolute", left: 100, top: LOGO_CY - 330, transform: `translateY(${Math.sin(t * 2.4) * 8}px) rotate(${Math.sin(t * 1.7) * 1.6}deg) scale(${scale})` }}>
          <GULogo texture={textures[idx]} width={880} height={660} t={t} />
        </div>
        <SparkBurst age={age} cx={540} cy={LOGO_CY} seed={`p${idx}`} spread={400} />
        <div style={{ position: "absolute", top: 880, left: 20, right: 20, textAlign: "center", transform: `scale(${beatBounce})` }}>
          <div style={{ ...display, fontSize: 98, whiteSpace: "nowrap", color: C.cream, textShadow: sticker(C.ink, 9), transform: `translateY(${(1 - l1) * 50}px) scale(${0.5 + 0.5 * l1}) rotate(-2deg)`, opacity: clamp(l1 * 2) }}>
            {GUP.end.lines[0]}
          </div>
          <div style={{ ...display, fontWeight: 800, fontSize: 70, color: C.ink, marginTop: 16, transform: `translateY(${(1 - l2) * 30}px)`, opacity: clamp(l2 * 2) }}>{GUP.end.lines[1]}</div>
        </div>
        <div style={{ position: "absolute", top: 1125, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", ...display, fontWeight: 800, fontSize: 86, color: C.cream, background: C.ink, padding: "22px 66px 34px", borderRadius: 999, overflow: "hidden", boxShadow: "0 10px 0 rgba(0,0,0,0.25)", transform: `scale(${Math.max(0, url)}) rotate(-2deg)` }}>
            {GU.url}
            {frame > 2 * BEAT ? (
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${-40 + shimmer * 180}%`, width: "28%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)", transform: "skewX(-20deg)" }} />
            ) : null}
          </div>
        </div>
        {/* lien dans la bio */}
        <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${Math.max(0, hint)})` }}>
          <div style={{ ...display, fontWeight: 800, fontSize: 54, color: C.ink, background: C.cream, padding: "12px 38px 20px", borderRadius: 999, border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, transform: "rotate(2deg)" }}>
            {GUP.end.hint}
          </div>
          <svg width={60} height={70} viewBox="0 0 24 28" style={{ transform: `translateY(${arrow}px)` }}>
            <path d="M12 2v20M4 15l8 8 8-8" stroke={C.cream} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {[0, 1, 2, 3].map((k) => (
          <Sparkle key={k} x={[140, 940, 120, 950][k]} y={[900, 1080, 1330, 1460][k]} size={26} t={((frame + k * 17) % 50) / 50} color={C.cream} />
        ))}
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── Composition ───────────── */

const SCENES: SceneDef[] = [
  { key: "hook", Component: Hook, duration: F.hook, enter: "none", exit: "none" },
  { key: "logo", Component: LogoSlam, duration: F.logo, enter: "none", exit: "none" },
  { key: "site", Component: SitePhone, duration: F.site, enter: "none", exit: "none" },
  ...promoTees.map((Component, i) => ({ key: `tee${i}`, Component, duration: F.tee, enter: "none" as const, exit: "none" as const })),
  { key: "limited", Component: Limited, duration: F.limited, enter: "none", exit: "none" },
  { key: "manif", Component: Manif, duration: F.manif, enter: "none", exit: "none" },
  { key: "end", Component: EndPromo, duration: F.end, enter: "none", exit: "none" },
];

const SlowZoom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${1.01 + 0.04 * (frame / GUP_TOTAL_FRAMES)})` }}>{children}</AbsoluteFill>;
};

export const GaucheUpPromo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.cream }}>
    {["logo-mask.png", "logo-outline.png"].map((f) => (
      <Img key={f} src={asset(f)} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
    ))}
    <SlowZoom>
      <SceneTimeline scenes={SCENES} pad={HALF} />
    </SlowZoom>
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 65%, rgba(0,0,0,0.12) 100%)" }} />
    <Grain />
    <Audio src={staticFile("gaucheup/gaucheup-promo-music.wav")} />
  </AbsoluteFill>
);
