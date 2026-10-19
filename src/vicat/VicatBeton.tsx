import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Camera, SceneDef, SceneTimeline } from "../lib/timeline";
import { VICAT, vsec } from "./config";
import { Backdrop, VicatGrain } from "./components/Backdrop";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Hook } from "./scenes/Scene2Hook";
import { Scene3Offer } from "./scenes/Scene3Offer";
import { Scene4Carbon } from "./scenes/Scene4Carbon";
import { Scene5Services } from "./scenes/Scene5Services";
import { Scene6Stat } from "./scenes/Scene6Stat";
import { Scene7Outro } from "./scenes/Scene7Outro";

const D = VICAT.durations;

/** Ordre des scènes et style des fondus enchaînés (même grammaire que Promptly). */
const SCENES: SceneDef[] = [
  { key: "intro", Component: Scene1Intro, duration: vsec(D.intro), enter: "none", exit: "dissolve" },
  { key: "hook", Component: Scene2Hook, duration: vsec(D.hook), enter: "dissolve", exit: "blur" },
  { key: "offer", Component: Scene3Offer, duration: vsec(D.offer), enter: "blur", exit: "blur" },
  { key: "carbon", Component: Scene4Carbon, duration: vsec(D.carbon), enter: "blur", exit: "blur" },
  { key: "services", Component: Scene5Services, duration: vsec(D.services), enter: "blur", exit: "dissolve" },
  { key: "stat", Component: Scene6Stat, duration: vsec(D.stat), enter: "dissolve", exit: "dissolve" },
  { key: "outro", Component: Scene7Outro, duration: vsec(D.outro), enter: "dissolve", exit: "none" },
];

const PAD = Math.round(vsec(VICAT.transition) / 2);

export const VicatBeton: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: VICAT.background.edge }}>
    <Backdrop />
    <Camera>
      <SceneTimeline scenes={SCENES} pad={PAD} />
    </Camera>
    <VicatGrain />
    {VICAT.music ? <Audio src={staticFile(VICAT.music)} volume={VICAT.musicVolume} /> : null}
  </AbsoluteFill>
);
