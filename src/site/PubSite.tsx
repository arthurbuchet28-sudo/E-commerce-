import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, Grain } from "../components/Background";
import { Camera, SceneDef, SceneTimeline } from "../lib/timeline";
import { SITE, ssec } from "./config";
import { Scene1Laptop } from "./scenes/Scene1Laptop";
import { Scene2Dive } from "./scenes/Scene2Dive";
import { Scene3Generate } from "./scenes/Scene3Generate";
import { Scene4Stat } from "./scenes/Scene4Stat";
import { Scene5Screens } from "./scenes/Scene5Screens";
import { Scene6Logo } from "./scenes/Scene6Logo";

const D = SITE.durations;

/** Ordre des scènes et style des fondus enchaînés. */
const SCENES: SceneDef[] = [
  { key: "intro", Component: Scene1Laptop, duration: ssec(D.intro), enter: "none", exit: "dissolve" },
  { key: "dive", Component: Scene2Dive, duration: ssec(D.dive), enter: "dissolve", exit: "blur" },
  { key: "generate", Component: Scene3Generate, duration: ssec(D.generate), enter: "blur", exit: "blur" },
  { key: "stat", Component: Scene4Stat, duration: ssec(D.stat), enter: "blur", exit: "blur" },
  { key: "screens", Component: Scene5Screens, duration: ssec(D.screens), enter: "blur", exit: "dissolve" },
  { key: "outro", Component: Scene6Logo, duration: ssec(D.outro), enter: "dissolve", exit: "none" },
];

const PAD = Math.round(ssec(SITE.transition) / 2);

export const PubSite: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: SITE.background.edge }}>
    <Background center={SITE.background.center} edge={SITE.background.edge} color={SITE.accent} />
    <Camera>
      <SceneTimeline scenes={SCENES} pad={PAD} />
    </Camera>
    <Grain />
  </AbsoluteFill>
);
