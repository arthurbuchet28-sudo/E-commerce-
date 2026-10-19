import React from "react";
import { CONFIG } from "../config";
import { accent, formatNumber } from "../lib/utils";
import {
  Card,
  font,
  IconChart,
  IconChevron,
  IconDumbbell,
  IconHome,
  IconPlay,
  IconPlus,
  IconTrophy,
  IconUser,
  Ring,
  ScreenBackground,
  StatusBar,
  ui,
} from "./kit";

/* ───────────── Éléments de l'écran d'accueil ───────────── */

const Header: React.FC = () => (
  <div style={{ ...font, display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
    <div>
      <div style={{ fontSize: 13, color: ui.muted, fontWeight: 500 }}>{CONFIG.dateLabel}</div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}>
        Bonjour, {CONFIG.userName}
      </div>
    </div>
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 23,
        background: `linear-gradient(135deg, ${accent.light}, ${accent.deep})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 17,
        boxShadow: `0 0 18px ${accent.a(0.5)}`,
      }}
    >
      {CONFIG.userName.slice(0, 1)}
    </div>
  </div>
);

const GoalCard: React.FC = () => (
  <Card style={{ padding: 18, display: "flex", alignItems: "center", gap: 18 }}>
    <Ring
      size={108}
      progress={0.8}
      stroke={11}
      label={
        <>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>4/5</div>
          <div style={{ fontSize: 11, color: ui.muted, fontWeight: 600 }}>séances</div>
        </>
      }
    />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: ui.muted, fontWeight: 600 }}>Objectif de la semaine</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, letterSpacing: -0.4 }}>Plus qu'une !</div>
      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>3 h 42</div>
          <div style={{ fontSize: 11, color: ui.muted }}>Temps</div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>12,4 t</div>
          <div style={{ fontSize: 11, color: ui.muted }}>Volume</div>
        </div>
      </div>
    </div>
  </Card>
);

export const RecordCard: React.FC = () => (
  <Card highlight style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        background: accent.a(0.25),
        border: `1px solid ${accent.a(0.5)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 20px ${accent.a(0.45)}`,
      }}
    >
      <IconTrophy size={26} color={accent.pale} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: accent.pale, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
        {CONFIG.stat.label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3, color: ui.muted }}>{CONFIG.stat.exercise}</div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6 }}>
      {formatNumber(CONFIG.stat.value, CONFIG.stat.decimals)}
      <span style={{ fontSize: 15, color: ui.muted, marginLeft: 3 }}>{CONFIG.stat.unit}</span>
    </div>
  </Card>
);

const TodayCard: React.FC = () => (
  <Card style={{ padding: "16px 18px" }}>
    <div style={{ fontSize: 12, color: ui.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
      Séance du jour
    </div>
    <div style={{ fontSize: 21, fontWeight: 800, marginTop: 4, letterSpacing: -0.4 }}>Push · Pecs & épaules</div>
    <div style={{ fontSize: 13, color: ui.muted, marginTop: 4 }}>6 exercices · 55 min</div>
  </Card>
);

export const StartButton: React.FC = () => (
  <div
    style={{
      ...font,
      width: "100%",
      height: "100%",
      borderRadius: 999,
      background: `linear-gradient(180deg, ${accent.light}, ${accent.base})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      fontSize: 14,
      fontWeight: 800,
      boxShadow: `0 0 22px ${accent.a(0.6)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
    }}
  >
    <IconPlay size={12} /> Go
  </div>
);

const ExerciseRow: React.FC<{ name: string; detail: string; done?: boolean }> = ({ name, detail, done }) => (
  <Card style={{ padding: "0 14px", display: "flex", alignItems: "center", gap: 12, borderRadius: 16 }}>
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        background: done ? accent.a(0.22) : "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconDumbbell size={18} color={done ? accent.pale : ui.muted} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div>
      <div style={{ fontSize: 12, color: ui.muted, marginTop: 1 }}>{detail}</div>
    </div>
    <IconChevron color={ui.faint} />
  </Card>
);

const TabBar: React.FC = () => {
  const tabs = [
    { Icon: IconHome, label: "Accueil", active: true },
    { Icon: IconChart, label: "Stats" },
    { Icon: IconPlus, label: "", center: true },
    { Icon: IconTrophy, label: "Records" },
    { Icon: IconUser, label: "Profil" },
  ];
  return (
    <div
      style={{
        ...font,
        width: "100%",
        height: "100%",
        borderTop: `1px solid ${ui.border}`,
        background: "rgba(10,12,18,0.85)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        paddingTop: 10,
        boxSizing: "border-box",
      }}
    >
      {tabs.map(({ Icon, label, active, center }, i) =>
        center ? (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              marginTop: -4,
              background: accent.base,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${accent.a(0.6)}`,
            }}
          >
            <Icon size={22} />
          </div>
        ) : (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 56 }}>
            <Icon size={22} color={active ? accent.light : ui.faint} />
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? accent.light : ui.faint }}>{label}</span>
          </div>
        ),
      )}
    </div>
  );
};

/* ───────────── Mise en page (partagée avec la scène 2) ───────────── */

export type HomeItem = {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  node: React.ReactNode;
};

export const HOME_ITEMS: HomeItem[] = [
  { key: "header", x: 22, y: 62, w: 340, h: 62, node: <Header /> },
  { key: "goal", x: 20, y: 140, w: 344, h: 146, node: <GoalCard /> },
  { key: "record", x: 20, y: 300, w: 344, h: 86, node: <RecordCard /> },
  { key: "today", x: 20, y: 400, w: 344, h: 100, node: <TodayCard /> },
  { key: "start", x: 278, y: 430, w: 70, h: 40, node: <StartButton /> },
  { key: "ex1", x: 20, y: 512, w: 344, h: 60, node: <ExerciseRow name="Développé couché" detail="4 × 6 · 95 kg" done /> },
  { key: "ex2", x: 20, y: 580, w: 344, h: 60, node: <ExerciseRow name="Développé militaire" detail="4 × 8 · 50 kg" /> },
  { key: "ex3", x: 20, y: 648, w: 344, h: 60, node: <ExerciseRow name="Dips lestés" detail="3 × 10 · +15 kg" /> },
  { key: "tabbar", x: 0, y: 740, w: 384, h: 84, node: <TabBar /> },
];

/**
 * Écran principal de l'app. `reveal(i)` renvoie la progression d'apparition (0→1)
 * de chaque bloc, pour animer l'interface quand le téléphone arrive.
 */
export const HomeScreen: React.FC<{ reveal?: (index: number) => number }> = ({ reveal }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <ScreenBackground />
    <StatusBar />
    {HOME_ITEMS.map((it, i) => {
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
            transform: `translateY(${(1 - p) * 24}px) scale(${0.96 + 0.04 * p})`,
          }}
        >
          {it.node}
        </div>
      );
    })}
  </div>
);
