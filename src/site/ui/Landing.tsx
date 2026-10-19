import React from "react";
import { SITE } from "../config";
import { A, B, brandGradient, sfont, ui } from "../theme";
import { AIThumb, BrowserChrome, Card, CHROME_H, IconPlay, IconSpark, MiniLogo, Pill, SiteBackground, ThumbVariant } from "./kit";

/* ───────────── Blocs de la landing ───────────── */

const Nav: React.FC = () => (
  <div style={{ ...sfont, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
      <MiniLogo size={34} /> {SITE.siteName}
    </div>
    <div style={{ display: "flex", gap: 36, fontSize: 15, fontWeight: 600, color: ui.muted }}>
      <span style={{ color: ui.text }}>Formations</span>
      <span>Studio</span>
      <span>Communauté</span>
      <span>Tarifs</span>
    </div>
    <div
      style={{
        padding: "11px 22px",
        borderRadius: 999,
        fontSize: 15,
        fontWeight: 700,
        background: "rgba(255,255,255,0.08)",
        border: `1px solid ${ui.border}`,
      }}
    >
      Se connecter
    </div>
  </div>
);

const Badge: React.FC = () => (
  <div style={{ display: "flex", justifyContent: "center", height: "100%", alignItems: "center" }}>
    <Pill>
      <IconSpark size={14} color={A.pale} filled /> Nouveau · Module génération vidéo
    </Pill>
  </div>
);

const Title: React.FC = () => (
  <div style={{ ...sfont, textAlign: "center", fontSize: 66, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.08 }}>
    <div>{SITE.heroTitle[0]}</div>
    <div
      style={{
        background: `linear-gradient(90deg, ${A.light}, ${B.light})`,
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      {SITE.heroTitle[1]}
    </div>
  </div>
);

const Subtitle: React.FC = () => (
  <div style={{ ...sfont, textAlign: "center", fontSize: 19, color: ui.muted, fontWeight: 500 }}>{SITE.heroSubtitle}</div>
);

/** Champ de prompt avec bouton « Générer » (réutilisé en grand dans la scène 3). */
export const PromptField: React.FC<{ text?: string; placeholder?: string; scale?: number; buttonScale?: number; caret?: boolean }> = ({
  text,
  placeholder = "Décrivez la vidéo que vous imaginez…",
  scale = 1,
  buttonScale = 1,
  caret,
}) => (
  <div
    style={{
      ...sfont,
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      borderRadius: 20 * scale,
      background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))",
      backgroundColor: ui.cardSolid,
      border: `1px solid ${A.a(0.45)}`,
      boxShadow: `0 0 0 ${4 * scale}px ${A.a(0.08)}, 0 0 ${40 * scale}px ${A.a(0.25)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
      display: "flex",
      alignItems: "center",
      gap: 14 * scale,
      padding: `0 ${10 * scale}px 0 ${22 * scale}px`,
    }}
  >
    <IconSpark size={24 * scale} color={A.light} />
    <div
      style={{
        flex: 1,
        fontSize: 18 * scale,
        fontWeight: 500,
        color: text ? ui.text : ui.muted,
        whiteSpace: "nowrap",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {text ?? placeholder}
      {caret ? <span style={{ display: "inline-block", width: 3 * scale, height: 26 * scale, marginLeft: 3 * scale, background: A.light, boxShadow: `0 0 8px ${A.base}` }} /> : null}
    </div>
    <div
      style={{
        height: 52 * scale,
        padding: `0 ${26 * scale}px`,
        borderRadius: 14 * scale,
        background: brandGradient(),
        display: "flex",
        alignItems: "center",
        gap: 8 * scale,
        fontSize: 17 * scale,
        fontWeight: 800,
        boxShadow: `0 0 ${24 * scale}px ${A.a(0.6)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
        transform: `scale(${buttonScale})`,
      }}
    >
      <IconSpark size={18 * scale} filled /> {SITE.generateLabel}
    </div>
  </div>
);

const CourseCard: React.FC<{ title: string; meta: string; level: string; variant: ThumbVariant; progress: number }> = ({
  title,
  meta,
  level,
  variant,
  progress,
}) => (
  <Card style={{ padding: 12 }}>
    <div style={{ position: "relative", height: 124, borderRadius: 14, overflow: "hidden" }}>
      <AIThumb variant={variant} />
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          width: 34,
          height: 34,
          borderRadius: 17,
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconPlay size={14} />
      </div>
    </div>
    <div style={{ padding: "12px 6px 0" }}>
      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, color: ui.muted, fontWeight: 600 }}>
        <span>{meta}</span>
        <span style={{ color: A.pale }}>{level}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginTop: 10 }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 2, background: brandGradient(90), boxShadow: `0 0 8px ${A.a(0.8)}` }} />
      </div>
    </div>
  </Card>
);

const ModuleProgress: React.FC = () => (
  <div
    style={{
      ...sfont,
      height: "100%",
      boxSizing: "border-box",
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      border: `1px solid ${ui.border}`,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 18px",
      fontSize: 14,
      fontWeight: 700,
    }}
  >
    <span>Module 3/8</span>
    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ width: "37.5%", height: "100%", borderRadius: 3, background: brandGradient(90), boxShadow: `0 0 10px ${A.a(0.8)}` }} />
    </div>
    <span style={{ color: ui.muted }}>37 %</span>
  </div>
);

/* ───────────── Mise en page (partagée avec la scène 2) ───────────── */

export type LandingItem = { key: string; x: number; y: number; w: number; h: number; node: React.ReactNode };

const Y = CHROME_H;
export const LANDING_ITEMS: LandingItem[] = [
  { key: "nav", x: 0, y: Y, w: 1280, h: 72, node: <Nav /> },
  { key: "badge", x: 440, y: Y + 92, w: 400, h: 36, node: <Badge /> },
  { key: "title", x: 190, y: Y + 140, w: 900, h: 150, node: <Title /> },
  { key: "subtitle", x: 240, y: Y + 300, w: 800, h: 28, node: <Subtitle /> },
  { key: "prompt", x: 260, y: Y + 348, w: 760, h: 72, node: <PromptField /> },
  { key: "card1", x: 70, y: Y + 452, w: 360, h: 220, node: <CourseCard title="L'art du prompt vidéo" meta="12 leçons · 1 h 40" level="Débutant" variant="neon" progress={1} /> },
  { key: "card2", x: 460, y: Y + 452, w: 360, h: 220, node: <CourseCard title="Mouvements de caméra IA" meta="9 leçons · 1 h 15" level="Intermédiaire" variant="city" progress={0.6} /> },
  { key: "card3", x: 850, y: Y + 452, w: 360, h: 220, node: <CourseCard title="Monter un court-métrage" meta="14 leçons · 2 h 30" level="Avancé" variant="desert" progress={0.1} /> },
  { key: "progress", x: 340, y: Y + 690, w: 600, h: 44, node: <ModuleProgress /> },
];

/** La landing page complète ; `reveal(i)` → progression d'apparition (0 → 1) de chaque bloc. */
export const Landing: React.FC<{ reveal?: (index: number) => number }> = ({ reveal }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <SiteBackground />
    <BrowserChrome />
    {LANDING_ITEMS.map((it, i) => {
      const p = reveal ? reveal(i) : 1;
      return (
        <div
          key={it.key}
          style={{
            position: "absolute",
            left: it.x,
            top: it.y,
            width: it.w,
            height: it.h,
            opacity: p,
            transform: `translateY(${(1 - p) * 26}px)`,
          }}
        >
          {it.node}
        </div>
      );
    })}
  </div>
);
