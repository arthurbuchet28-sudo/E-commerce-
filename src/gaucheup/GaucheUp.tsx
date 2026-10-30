import React from "react";
import { AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame } from "remotion";
import { Grain } from "../components/Background";
import { useScene } from "../lib/scene";
import { SceneDef, SceneTimeline } from "../lib/timeline";
import { clamp, lerp, rgba } from "../lib/utils";
import { BEAT, GU, GU_SCENE_FRAMES as F, GU_TOTAL_FRAMES, ColorKey } from "./config";
import { asset, GULogo, HALF, Pushed, SparkBurst, Sparkle, Swirls, tee } from "./components";

const C = GU.colors;
const display: React.CSSProperties = { fontFamily: GU.fonts.display, fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 0.95 };
const body: React.CSSProperties = { fontFamily: GU.fonts.body, fontWeight: 800 };
/** Ombre « sticker » : décalage plein, sans flou. */
const sticker = (c: string, d = 8) => `0 ${d}px 0 ${c}`;

const popIn = (frame: number, at: number, fps: number, damping = 11) => spring({ frame: frame - at, fps, config: { damping, stiffness: 170, mass: 0.7 } });

/* ───────────── 1. Accroche : « Ça penche… à gauche. » (l'image penche vraiment) ───────────── */

const Hook: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const l1 = popIn(frame, -6, fps);
  const l2 = popIn(frame, BEAT, fps, 9);
  const tilt = spring({ frame: frame - BEAT - 6, fps, config: { damping: 7, stiffness: 120, mass: 0.8 } });
  return (
    <Pushed frame={frame} dur={duration} first>
      <AbsoluteFill style={{ background: C.red }}>
        <AbsoluteFill style={{ transform: `rotate(${-7 * tilt}deg) scale(${1 + 0.12 * tilt})`, transformOrigin: "30% 60%" }}>
          <Swirls frame={frame} color="#D52F3D" />
          <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", color: C.cream }}>
            <div style={{ ...display, fontSize: 150, textShadow: sticker(C.ink), transform: `translateY(${(1 - l1) * 60}px) scale(${0.6 + 0.4 * l1})`, opacity: clamp(l1 * 2) }}>
              {GU.hook[0]}
            </div>
            <div style={{ ...display, fontSize: 190, marginTop: 24, textShadow: sticker(C.ink, 10), transform: `translateY(${(1 - l2) * 60}px) scale(${0.5 + 0.5 * l2})`, opacity: clamp(l2 * 2) }}>
              {GU.hook[1]}
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── 2. Le logo s'écrase à l'écran ───────────── */

const LogoSlam: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const s = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 140, mass: 0.9 } });
  const landed = frame - 10;
  const shake = landed >= 0 && landed < 12 ? Math.sin(landed * 3) * 8 * Math.exp(-landed / 3) : 0;
  const eyebrow = popIn(frame, 16, fps, 14);
  const base = popIn(frame, BEAT + 2, fps, 12);
  return (
    <Pushed frame={frame} dur={duration}>
      <AbsoluteFill style={{ background: C.cream, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Swirls frame={frame} color={C.beige} />
        <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", ...body, fontSize: 36, letterSpacing: 10, textTransform: "uppercase", color: C.red, opacity: eyebrow, transform: `translateY(${(1 - eyebrow) * 20}px)` }}>
          {GU.eyebrow}
        </div>
        <div style={{ position: "absolute", left: 60, top: 560, transform: `scale(${lerp(2.6, 1, s)}) rotate(${lerp(-10, 0, s)}deg)`, opacity: clamp(s * 3) }}>
          <GULogo texture="original" width={960} height={680} />
        </div>
        <div style={{ position: "absolute", top: 1270, left: 0, right: 0, textAlign: "center", ...display, fontWeight: 800, fontSize: 82, color: C.ink, opacity: clamp(base * 2), transform: `translateY(${(1 - base) * 30}px)` }}>
          {GU.baseline}
        </div>
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── 3. Les t-shirts : les couleurs changent sur le temps ───────────── */

const TeeScene: React.FC<{ i: number }> = ({ i }) => {
  const { frame, fps, duration } = useScene();
  const t = GU.tees[i];
  const views = t.views;
  const idx = Math.max(0, Math.min(views.length - 1, Math.floor((frame + 2) / BEAT)));
  const prev = Math.max(0, idx - 1);
  const since = frame - idx * BEAT;
  const swapP = idx === 0 ? 1 : clamp((since + 2) / 6);
  const bump = idx === 0 ? 0 : 1 - spring({ frame: since, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } });
  const color = C[views[idx].color as ColorKey];
  const prevColor = C[views[prev].color as ColorKey];
  const head = popIn(frame, -2, fps, 13);
  const cap = popIn(frame, 10, fps, 13);
  const priceP = popIn(frame, 14, fps, 9);
  const chips = Array.from(new Set(views.map((v) => v.color)));
  const limited = "limited" in t && t.limited;
  return (
    <Pushed frame={frame} dur={duration}>
      <AbsoluteFill style={{ background: C.cream }}>
        <Swirls frame={frame + i * 80} color={C.beige} />
        {/* halo de la couleur active derrière le t-shirt */}
        <div
          style={{
            position: "absolute",
            left: 540 - 620,
            top: 920 - 620,
            width: 1240,
            height: 1240,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(swapP < 1 ? prevColor : color, 0.28)} 0%, transparent 62%)`,
          }}
        />
        <div style={{ position: "absolute", left: 540 - 620, top: 920 - 620, width: 1240, height: 1240, borderRadius: "50%", background: `radial-gradient(circle, ${rgba(color, 0.28)} 0%, transparent 62%)`, opacity: swapP }} />
        {/* en-tête */}
        <div style={{ position: "absolute", top: 200, left: 70, right: 70, textAlign: "center", opacity: clamp(head * 2), transform: `translateY(${(1 - head) * 30}px)` }}>
          <div
            style={{
              ...body,
              display: "inline-block",
              fontSize: 30,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: limited ? C.cream : C.red,
              background: limited ? C.ink : "transparent",
              padding: limited ? "8px 22px" : 0,
              borderRadius: 999,
            }}
          >
            {t.n}
          </div>
          <div style={{ ...display, fontSize: limited ? 70 : 104, color: C.ink, marginTop: 14 }}>{t.name}</div>
        </div>
        {/* carte du t-shirt */}
        <div
          style={{
            position: "absolute",
            left: 90,
            top: limited ? 500 : 470,
            width: 900,
            height: 900,
            borderRadius: 48,
            overflow: "hidden",
            background: "#fff",
            boxShadow: `0 40px 80px rgba(17,17,17,0.18), 0 0 0 6px ${C.ink}`,
            transform: `scale(${1 + 0.05 * bump}) rotate(${-1.5 * bump}deg)`,
          }}
        >
          <Img src={tee(views[prev].img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <Img src={tee(views[idx].img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: swapP }} />
        </div>
        {/* pastille prix */}
        <div
          style={{
            position: "absolute",
            right: 150,
            top: (limited ? 500 : 470) - 46,
            ...display,
            fontWeight: 800,
            fontSize: 44,
            color: C.cream,
            background: C.red,
            padding: "16px 30px",
            borderRadius: 999,
            border: `5px solid ${C.ink}`,
            transform: `rotate(-7deg) scale(${Math.max(0, priceP)})`,
          }}
        >
          {t.price}
        </div>
        {/* coloris */}
        <div style={{ position: "absolute", top: 1418, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          {chips.map((c) => {
            const active = c === views[idx].color;
            return (
              <div
                key={c}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  background: C[c as ColorKey],
                  border: `4px solid ${C.ink}`,
                  boxShadow: active ? `0 0 0 6px ${C.cream}, 0 0 0 10px ${C.ink}` : undefined,
                  transform: `scale(${active ? 1.1 : 0.9})`,
                }}
              />
            );
          })}
          <div style={{ ...body, fontSize: 32, color: C.ink, marginLeft: 12 }}>{t.colorsLabel}</div>
        </div>
        {/* légende */}
        <div style={{ position: "absolute", top: 1515, left: 60, right: 60, textAlign: "center", ...display, fontWeight: 800, fontSize: 58, color: C.ink, opacity: clamp(cap * 2), transform: `translateY(${(1 - cap) * 24}px)` }}>
          {t.caption}
        </div>
      </AbsoluteFill>
    </Pushed>
  );
};
const teeScenes = GU.tees.map((_, i) => {
  const Comp: React.FC = () => <TeeScene i={i} />;
  return Comp;
});

/* ───────────── 4. Mosaïque des t-shirts portés ───────────── */

const Mosaic: React.FC = () => {
  const { frame, fps, duration } = useScene();
  const l1 = popIn(frame, 0, fps, 10);
  const l2 = popIn(frame, BEAT, fps, 10);
  return (
    <Pushed frame={frame} dur={duration}>
      <AbsoluteFill style={{ background: C.ink }}>
        {GU.lifestyle.map((name, i) => {
          const p = popIn(frame, -HALF + i * 3, fps, 14);
          const col = i % 2;
          const row = Math.floor(i / 2);
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: 30 + col * 520,
                top: 90 + row * 590,
                width: 500,
                height: 570,
                borderRadius: 36,
                overflow: "hidden",
                transform: `scale(${0.82 + 0.18 * p}) rotate(${(col ? 2 : -2) * (1 - p)}deg)`,
                opacity: clamp(p * 2),
              }}
            >
              <Img src={tee(name)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 + frame * 0.0012})` }} />
            </div>
          );
        })}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(17,17,17,0.55) 0%, rgba(17,17,17,0.15) 100%)" }} />
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ ...display, fontSize: 150, color: C.cream, background: C.red, padding: "18px 46px 30px", borderRadius: 40, border: `6px solid ${C.ink}`, transform: `rotate(-4deg) scale(${l1})` }}>{GU.mosaic[0]}</div>
          <div style={{ ...display, fontWeight: 800, fontSize: 78, color: C.ink, background: C.cream, padding: "14px 36px 22px", borderRadius: 999, border: `6px solid ${C.ink}`, transform: `rotate(3deg) scale(${l2})` }}>
            {GU.mosaic[1]}
          </div>
        </div>
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── 5. Écran de fin : le logo change de texture à chaque temps ───────────── */

const EndCard: React.FC = () => {
  const { frame, absFrame, fps, duration } = useScene();
  const t = absFrame / fps;
  const textures = GU.logoTextures;
  const idx = Math.max(0, Math.min(textures.length - 1, Math.floor(frame / BEAT)));
  const age = frame - idx * BEAT;
  const pop = spring({ frame: age, fps, config: { damping: 9, stiffness: 190, mass: 0.6 } });
  const scale = idx === 0 ? pop : 1 + 0.12 * (1 - pop);
  const ring = clamp(age / 16);
  const sinceBeat = frame - Math.floor(frame / BEAT) * BEAT;
  const beatBounce = frame > BEAT ? 1 + 0.035 * Math.exp(-sinceBeat / 5) : 1;
  const w1 = popIn(frame, 8, fps, 9);
  const w2 = popIn(frame, 18, fps, 9);
  const sub = popIn(frame, 40, fps, 14);
  const url = popIn(frame, 2 * BEAT, fps, 9);
  const hint = popIn(frame, 2 * BEAT + 14, fps, 14);
  const shimmer = ((frame - 2 * BEAT) % (2 * BEAT)) / (2 * BEAT);
  const LOGO_CY = 540;
  return (
    <Pushed frame={frame} dur={duration} last>
      <AbsoluteFill style={{ background: C.red }}>
        <Swirls frame={frame} color="#D52F3D" />
        {/* onde de choc à chaque changement de texture */}
        {ring < 1 ? (
          <div
            style={{
              position: "absolute",
              left: 540 - 420,
              top: LOGO_CY - 420,
              width: 840,
              height: 840,
              borderRadius: "50%",
              border: `10px solid ${C.cream}`,
              opacity: (1 - ring) * 0.55,
              transform: `scale(${0.6 + ring * 0.7})`,
            }}
          />
        ) : null}
        {/* logo */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: LOGO_CY - 360,
            transform: `translateY(${Math.sin(t * 2.4) * 8}px) rotate(${Math.sin(t * 1.7) * 1.6}deg) scale(${scale})`,
          }}
        >
          <GULogo texture={textures[idx]} width={940} height={720} t={t} />
        </div>
        <SparkBurst age={age} cx={540} cy={LOGO_CY} seed={`e${idx}`} />
        {/* C'EST LANCÉ ! */}
        <div style={{ position: "absolute", top: 965, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34, transform: `scale(${beatBounce})` }}>
          {[w1, w2].map((p, k) => (
            <div key={k} style={{ ...display, fontSize: 168, color: C.cream, textShadow: sticker(C.ink, 10), transform: `translateY(${(1 - p) * 70}px) scale(${0.4 + 0.6 * p}) rotate(${k ? 3 : -3}deg)`, opacity: clamp(p * 2) }}>
              {GU.launch[k]}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 1170, left: 0, right: 0, textAlign: "center", ...body, fontSize: 40, letterSpacing: 2, color: C.ink, opacity: clamp(sub * 2), transform: `translateY(${(1 - sub) * 20}px)` }}>
          {GU.launchSub}
        </div>
        {/* URL */}
        <div style={{ position: "absolute", top: 1270, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              ...display,
              fontWeight: 800,
              fontSize: 82,
              color: C.cream,
              background: C.ink,
              padding: "22px 64px 32px",
              borderRadius: 999,
              overflow: "hidden",
              boxShadow: `0 10px 0 rgba(0,0,0,0.25)`,
              transform: `scale(${Math.max(0, url)}) rotate(-2deg)`,
            }}
          >
            {GU.url}
            {frame > 2 * BEAT ? (
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${-40 + shimmer * 180}%`, width: "28%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)", transform: "skewX(-20deg)" }} />
            ) : null}
          </div>
        </div>
        <div style={{ position: "absolute", top: 1445, left: 0, right: 0, textAlign: "center", ...body, fontSize: 34, color: C.cream, opacity: clamp(hint * 2) * 0.9, letterSpacing: 3, textTransform: "uppercase" }}>
          {GU.linkHint} ↓
        </div>
        {/* étincelles d'ambiance */}
        {[0, 1, 2, 3, 4].map((k) => (
          <Sparkle key={k} x={[150, 930, 120, 960, 540][k]} y={[1000, 1150, 1380, 1460, 1600][k]} size={26} t={(((frame + k * 17) % 50) / 50)} color={C.cream} />
        ))}
      </AbsoluteFill>
    </Pushed>
  );
};

/* ───────────── Composition ───────────── */

const SCENES: SceneDef[] = [
  { key: "hook", Component: Hook, duration: F.hook, enter: "none", exit: "none" },
  { key: "logo", Component: LogoSlam, duration: F.logo, enter: "none", exit: "none" },
  ...teeScenes.map((Component, i) => ({ key: `tee${i}`, Component, duration: F.tee, enter: "none" as const, exit: "none" as const })),
  { key: "mosaic", Component: Mosaic, duration: F.mosaic, enter: "none", exit: "none" },
  { key: "end", Component: EndCard, duration: F.end, enter: "none", exit: "none" },
];

/** Zoom très lent et continu (sans rotation : pas de bords qui apparaissent). */
const SlowZoom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `scale(${1.01 + 0.04 * (frame / GU_TOTAL_FRAMES)})` }}>{children}</AbsoluteFill>;
};

export const GaucheUp: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.cream }}>
    {/* les masques (forme des lettres) sont des images CSS : on les précharge pour que le rendu les attende */}
    {["logo-mask.png", "logo-outline.png"].map((f) => (
      <Img key={f} src={asset(f)} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
    ))}
    <SlowZoom>
      <SceneTimeline scenes={SCENES} pad={HALF} />
    </SlowZoom>
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 65%, rgba(0,0,0,0.12) 100%)" }} />
    <Grain />
    <Audio src={staticFile("gaucheup/gaucheup-music.wav")} />
  </AbsoluteFill>
);

