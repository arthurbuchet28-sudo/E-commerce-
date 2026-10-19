import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, Grain } from "./components/Background";
import { CONFIG, sec } from "./config";
import { Camera, SceneDef, SceneTimeline } from "./lib/timeline";
import { Scene1Phone } from "./scenes/Scene1Phone";
import { Scene2Dive } from "./scenes/Scene2Dive";
import { Scene3Stat } from "./scenes/Scene3Stat";
import { Scene4Screens } from "./scenes/Scene4Screens";
import { Scene5Logo } from "./scenes/Scene5Logo";

/** Ordre des scènes et style des fondus enchaînés. */
const SCENES: SceneDef[] = [
  { key: "intro", Component: Scene1Phone, duration: sec(CONFIG.durations.intro), enter: "none", exit: "dissolve" },
  { key: "dive", Component: Scene2Dive, duration: sec(CONFIG.durations.dive), enter: "dissolve", exit: "blur" },
  { key: "stat", Component: Scene3Stat, duration: sec(CONFIG.durations.stat), enter: "blur", exit: "blur" },
  { key: "screens", Component: Scene4Screens, duration: sec(CONFIG.durations.screens), enter: "blur", exit: "dissolve" },
  { key: "outro", Component: Scene5Logo, duration: sec(CONFIG.durations.outro), enter: "dissolve", exit: "none" },
];

const PAD = Math.round(sec(CONFIG.transition) / 2);

export const Pub: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CONFIG.background.edge }}>
    <Background />
    <Camera>
      <SceneTimeline scenes={SCENES} pad={PAD} />
    </Camera>
    <Grain />
  </AbsoluteFill>
);
