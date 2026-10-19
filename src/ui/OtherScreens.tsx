import React from "react";
import { random } from "remotion";
import { CONFIG } from "../config";
import { accent, formatNumber } from "../lib/utils";
import { Card, font, IconCheck, IconFlame, IconTrophy, Pill, Ring, ScreenBackground, StatusBar, ui } from "./kit";

const Title: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <div style={{ ...font, position: "absolute", left: 22, top: 62, right: 22 }}>
    <div style={{ fontSize: 12, color: ui.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>
      {eyebrow}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>{title}</div>
  </div>
);

/* ───────────── Séance en cours ───────────── */

export const WorkoutScreen: React.FC<{ t?: number }> = ({ t = 0 }) => {
  const sets = [
    { kg: "95", reps: 6, done: true },
    { kg: "97,5", reps: 5, done: true },
    { kg: "100", reps: 3, done: true },
    { kg: formatNumber(CONFIG.stat.value, CONFIG.stat.decimals), reps: 1, done: true, pr: true },
  ];
  const seconds = 32 * 60 + 14 + Math.floor(t);
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <ScreenBackground />
      <StatusBar />
      <Title eyebrow="Séance en cours" title={CONFIG.stat.exercise} />
      <div style={{ position: "absolute", left: 20, right: 20, top: 140, height: 120 }}>
        <Card style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={font}>
            <div style={{ fontSize: 12, color: ui.muted, fontWeight: 600 }}>Durée</div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{timer}</div>
          </div>
          <Ring
            size={84}
            progress={0.62}
            stroke={8}
            label={
              <>
                <div style={{ fontSize: 15, fontWeight: 800 }}>1:24</div>
                <div style={{ fontSize: 9, color: ui.muted, fontWeight: 600 }}>repos</div>
              </>
            }
          />
        </Card>
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 278, display: "flex", flexDirection: "column", gap: 10 }}>
        {sets.map((s, i) => (
          <div key={i} style={{ height: 62 }}>
            <Card highlight={s.pr} style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 14, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: ui.muted, fontWeight: 700, width: 54 }}>Série {i + 1}</div>
              <div style={{ flex: 1, fontSize: 19, fontWeight: 800 }}>
                {s.kg} <span style={{ fontSize: 13, color: ui.muted }}>kg</span> × {s.reps}
              </div>
              {s.pr ? <Pill>PR</Pill> : null}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: s.done ? accent.base : "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: s.done ? `0 0 12px ${accent.a(0.6)}` : undefined,
                }}
              >
                <IconCheck size={15} />
              </div>
            </Card>
          </div>
        ))}
      </div>
      <div
        style={{
          ...font,
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 44,
          height: 58,
          borderRadius: 999,
          background: `linear-gradient(180deg, ${accent.light}, ${accent.base})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          fontWeight: 800,
          boxShadow: `0 0 26px ${accent.a(0.55)}`,
        }}
      >
        Exercice suivant
      </div>
    </div>
  );
};

/* ───────────── Progression (graphique) ───────────── */

export const PROGRESS_POINTS = [78, 80, 80, 84, 85, 88, 87, 91, 93, 95, 97.5, 100, CONFIG.stat.value];

export const ProgressScreen: React.FC<{ draw?: number }> = ({ draw = 1 }) => {
  const w = 304;
  const h = 170;
  const min = Math.min(...PROGRESS_POINTS) - 4;
  const max = Math.max(...PROGRESS_POINTS) + 2;
  const pts = PROGRESS_POINTS.map((v, i) => [
    (i / (PROGRESS_POINTS.length - 1)) * w,
    h - ((v - min) / (max - min)) * h,
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <ScreenBackground />
      <StatusBar />
      <Title eyebrow="Progression" title="Force max." />
      <div style={{ ...font, position: "absolute", left: 20, top: 140, display: "flex", gap: 8 }}>
        {["1M", "3M", "6M", "1A"].map((p) => (
          <div
            key={p}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              background: p === "3M" ? accent.base : "rgba(255,255,255,0.06)",
              color: p === "3M" ? "#fff" : ui.muted,
            }}
          >
            {p}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 188, height: 280 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: ui.muted, fontWeight: 600 }}>{CONFIG.stat.exercise} · 1RM</div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, marginTop: 2 }}>
            {formatNumber(CONFIG.stat.value, CONFIG.stat.decimals)} {CONFIG.stat.unit}
          </div>
          <svg width={w} height={h + 10} style={{ marginTop: 10, overflow: "visible" }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent.base} stopOpacity={0.45} />
                <stop offset="100%" stopColor={accent.base} stopOpacity={0} />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.06)" />
            ))}
            <path d={area} fill="url(#areaGrad)" opacity={draw} />
            <path
              d={line}
              fill="none"
              stroke={accent.light}
              strokeWidth={3.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - draw}
              style={{ filter: `drop-shadow(0 0 6px ${accent.a(0.9)})` }}
            />
            <circle cx={last[0]} cy={last[1]} r={7 * draw} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${accent.base})` }} />
          </svg>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 484, display: "flex", gap: 10, height: 96 }}>
        {[
          { v: "+18 %", l: "Volume" },
          { v: "42", l: "Séances" },
          { v: "7", l: "Records" },
        ].map((s) => (
          <div key={s.l} style={{ flex: 1 }}>
            <Card style={{ padding: 14, borderRadius: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: ui.muted, marginTop: 4 }}>{s.l}</div>
            </Card>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 596, height: 88 }}>
        <Card highlight style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <IconTrophy size={30} color={accent.pale} />
          <div style={font}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{CONFIG.stat.label} !</div>
            <div style={{ fontSize: 12, color: ui.muted, marginTop: 2 }}>{CONFIG.stat.delta}</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ───────────── Régularité (calendrier) ───────────── */

export const StreakScreen: React.FC = () => {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <ScreenBackground />
      <StatusBar />
      <Title eyebrow="Régularité" title="Série en cours" />
      <div style={{ position: "absolute", left: 20, right: 20, top: 140, height: 150 }}>
        <Card highlight style={{ padding: 20, display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 26,
              background: `radial-gradient(circle at 50% 60%, ${accent.a(0.55)}, ${accent.a(0.12)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${accent.a(0.5)}`,
            }}
          >
            <IconFlame size={44} color="#fff" />
          </div>
          <div style={font}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>27</div>
            <div style={{ fontSize: 14, color: ui.muted, fontWeight: 600, marginTop: 4 }}>jours d'affilée</div>
          </div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 306, height: 300 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Octobre</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {days.map((d, i) => (
              <div key={"d" + i} style={{ fontSize: 11, color: ui.muted, textAlign: "center", fontWeight: 700 }}>
                {d}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const r = random(`cal-${i}`);
              const level = i > 30 ? 0 : r > 0.75 ? 3 : r > 0.4 ? 2 : r > 0.18 ? 1 : 0;
              const alpha = [0.06, 0.3, 0.6, 1][level];
              return (
                <div
                  key={i}
                  style={{
                    height: 34,
                    borderRadius: 9,
                    background: level ? accent.a(alpha) : "rgba(255,255,255,0.05)",
                    boxShadow: level === 3 ? `0 0 10px ${accent.a(0.6)}` : undefined,
                  }}
                />
              );
            })}
          </div>
        </Card>
      </div>
      <div style={{ ...font, position: "absolute", left: 20, right: 20, top: 622, display: "flex", gap: 10 }}>
        {["30 séances", "5/5 semaine"].map((b) => (
          <div
            key={b}
            style={{
              flex: 1,
              padding: "14px 0",
              textAlign: "center",
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${ui.border}`,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
};
