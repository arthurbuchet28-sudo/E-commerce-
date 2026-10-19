import React from "react";
import { random } from "remotion";
import { SITE } from "../config";
import { A, B, brandGradient, sfont, ui } from "../theme";
import { AIThumb, BrowserChrome, Card, CHROME_H, IconAward, IconCheck, IconHeart, IconPlay, IconScissors, IconSpark, MiniLogo, Pill, SiteBackground } from "./kit";

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <SiteBackground />
    <BrowserChrome />
    <div style={{ position: "absolute", left: 0, right: 0, top: CHROME_H, bottom: 0 }}>{children}</div>
  </div>
);

const SideNav: React.FC<{ active: number }> = ({ active }) => (
  <div
    style={{
      ...sfont,
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 76,
      borderRight: `1px solid ${ui.border}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 22,
      gap: 26,
      background: "rgba(0,0,0,0.2)",
    }}
  >
    <MiniLogo size={36} />
    {[IconPlay, IconScissors, IconHeart, IconAward].map((Icon, i) => (
      <div
        key={i}
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: i === active ? A.a(0.22) : "transparent",
          border: i === active ? `1px solid ${A.a(0.45)}` : "1px solid transparent",
        }}
      >
        <Icon size={20} color={i === active ? A.pale : ui.muted} />
      </div>
    ))}
  </div>
);

/* ───────────── 1. Lecteur de leçon ───────────── */

export const LessonScreen: React.FC<{ t?: number }> = ({ t = 0 }) => {
  const chapters = ["Le prompt cinématographique", "Choisir son modèle", "Cadrage et objectif", "Lumière et ambiance", "Cohérence des plans"];
  return (
    <Shell>
      <SideNav active={0} />
      <div style={{ ...sfont, position: "absolute", left: 110, top: 30, right: 400 }}>
        <div style={{ fontSize: 14, color: ui.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>Module 3 · Leçon 4</div>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 4 }}>Lumière et ambiance</div>
        <div style={{ position: "relative", marginTop: 20, height: 430, borderRadius: 20, overflow: "hidden", boxShadow: `0 0 40px ${A.a(0.25)}` }}>
          <AIThumb variant="neon" t={t} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }} />
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <IconPlay size={22} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.25)" }}>
              <div style={{ width: `${42 + (t % 10) * 2}%`, height: "100%", borderRadius: 3, background: brandGradient(90), boxShadow: `0 0 10px ${A.base}` }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>04:12 / 09:30</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Pill>Exercice pratique</Pill>
          <Pill style={{ color: B.pale, background: B.a(0.14), borderColor: B.a(0.35) }}>Prompt fourni</Pill>
        </div>
      </div>
      <div style={{ position: "absolute", right: 34, top: 30, width: 340, bottom: 30 }}>
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Chapitres</div>
          {chapters.map((c, i) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, fontSize: 15, fontWeight: 600, color: i === 3 ? ui.text : ui.muted }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  flexShrink: 0,
                  background: i < 3 ? A.base : i === 3 ? A.a(0.25) : "rgba(255,255,255,0.06)",
                  border: i === 3 ? `2px solid ${A.light}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: i < 3 ? `0 0 10px ${A.a(0.6)}` : undefined,
                }}
              >
                {i < 3 ? <IconCheck size={14} /> : null}
              </div>
              {c}
            </div>
          ))}
          <div style={{ marginTop: 30, fontSize: 13, color: ui.muted, fontWeight: 600 }}>Progression du module</div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginTop: 10 }}>
            <div style={{ width: "62%", height: "100%", borderRadius: 4, background: brandGradient(90), boxShadow: `0 0 10px ${A.a(0.8)}` }} />
          </div>
        </Card>
      </div>
    </Shell>
  );
};

/* ───────────── 2. Éditeur / timeline ───────────── */

export const EditorScreen: React.FC<{ t?: number }> = ({ t = 0 }) => {
  const tracks = [
    { label: "Vidéo 1", color: A.base, clips: [[0, 0.22], [0.24, 0.5], [0.52, 0.8], [0.82, 1]] },
    { label: "Vidéo 2", color: B.base, clips: [[0.1, 0.34], [0.6, 0.9]] },
    { label: "Titres", color: "#F472B6", clips: [[0.05, 0.18], [0.7, 0.85]] },
  ];
  const playhead = 0.38 + ((t * 0.04) % 0.3);
  const TL_W = 1060;
  return (
    <Shell>
      <SideNav active={1} />
      <div style={{ ...sfont, position: "absolute", left: 110, top: 26, right: 34 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em" }}>Court-métrage · Néon</div>
          <div style={{ padding: "10px 20px", borderRadius: 12, background: brandGradient(), fontSize: 15, fontWeight: 800, boxShadow: `0 0 20px ${A.a(0.5)}` }}>
            Exporter 4K
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 18, height: 340 }}>
          <div style={{ flex: 1, borderRadius: 18, overflow: "hidden", boxShadow: `0 0 30px ${A.a(0.2)}` }}>
            <AIThumb variant="city" t={t} />
          </div>
          <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 12 }}>
            {(["neon", "forest", "desert"] as const).map((v) => (
              <div key={v} style={{ flex: 1, borderRadius: 14, overflow: "hidden", border: `1px solid ${ui.border}` }}>
                <AIThumb variant={v} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18, height: 300 }}>
          <Card style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 0, fontSize: 11, color: ui.faint, fontWeight: 600, marginLeft: 76 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ width: TL_W / 10 }}>00:{String(i * 3).padStart(2, "0")}</div>
              ))}
            </div>
            <div style={{ position: "relative", marginTop: 8 }}>
              {tracks.map((tr) => (
                <div key={tr.label} style={{ display: "flex", alignItems: "center", height: 44, marginBottom: 8 }}>
                  <div style={{ width: 76, fontSize: 12, color: ui.muted, fontWeight: 700 }}>{tr.label}</div>
                  <div style={{ position: "relative", width: TL_W, height: 36 }}>
                    {tr.clips.map(([a, b], k) => (
                      <div
                        key={k}
                        style={{
                          position: "absolute",
                          left: a * TL_W,
                          width: (b - a) * TL_W - 4,
                          top: 0,
                          bottom: 0,
                          borderRadius: 8,
                          background: `linear-gradient(180deg, ${tr.color}, ${tr.color}AA)`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 0 10px ${tr.color}55`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {/* waveform audio */}
              <div style={{ display: "flex", alignItems: "center", height: 50 }}>
                <div style={{ width: 76, fontSize: 12, color: ui.muted, fontWeight: 700 }}>Audio</div>
                <svg width={TL_W} height={44}>
                  {Array.from({ length: 150 }).map((_, i) => {
                    const h = 6 + Math.abs(Math.sin(i * 0.35) * Math.cos(i * 0.09)) * 30 + random(`wf${i}`) * 6;
                    return <rect key={i} x={i * (TL_W / 150)} y={22 - h / 2} width={3} height={h} rx={1.5} fill={B.light} opacity={0.75} />;
                  })}
                </svg>
              </div>
              {/* tête de lecture */}
              <div
                style={{
                  position: "absolute",
                  left: 76 + playhead * TL_W,
                  top: -8,
                  bottom: 0,
                  width: 2,
                  background: "#fff",
                  boxShadow: `0 0 10px ${A.light}, 0 0 20px ${A.base}`,
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
};

/* ───────────── 3. Communauté / certificat ───────────── */

export const CommunityScreen: React.FC = () => {
  const items = [
    { v: "neon" as const, a: "Léa", likes: "2,4 k" },
    { v: "forest" as const, a: "Hugo", likes: "1,8 k" },
    { v: "city" as const, a: "Sami", likes: "3,1 k" },
    { v: "desert" as const, a: "Inès", likes: "960" },
    { v: "city" as const, a: "Noah", likes: "1,2 k" },
    { v: "neon" as const, a: "Jade", likes: "4,7 k" },
  ];
  return (
    <Shell>
      <SideNav active={2} />
      <div style={{ ...sfont, position: "absolute", left: 110, top: 26, right: 400 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em" }}>Créations de la semaine</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
          {items.map((it, i) => (
            <div key={i} style={{ height: 300 }}>
              <Card style={{ padding: 10 }}>
                <div style={{ height: 210, borderRadius: 12, overflow: "hidden" }}>
                  <AIThumb variant={it.v} astronaut={i % 2 === 0} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        background: i % 2 ? `linear-gradient(135deg, ${B.light}, ${A.base})` : brandGradient(),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {it.a[0]}
                    </div>
                    {it.a}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: ui.muted, fontWeight: 700 }}>
                    <IconHeart size={16} color={A.light} /> {it.likes}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 34, top: 26, width: 340, height: 440 }}>
        <Card highlight style={{ padding: 26, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: `radial-gradient(circle at 50% 40%, ${A.a(0.6)}, ${A.a(0.12)})`,
              border: `2px solid ${A.light}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 40px ${A.a(0.6)}`,
              marginTop: 10,
            }}
          >
            <IconAward size={60} />
          </div>
          <div style={{ fontSize: 13, color: A.pale, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginTop: 26 }}>Certificat</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 8 }}>Réalisateur IA</div>
          <div style={{ fontSize: 14, color: ui.muted, marginTop: 8, lineHeight: 1.4 }}>Délivré par {SITE.siteName} après 8 modules et un projet final.</div>
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: B.pale }}>
            <IconSpark size={16} color={B.light} filled /> Partagé 2 300 fois
          </div>
        </Card>
      </div>
    </Shell>
  );
};
