import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background, Grain } from "../components/Background";
import { Camera, SceneDef, SceneTimeline } from "../lib/timeline";
import { BAR, BOOST } from "./config";
import { S1Hook, S2Problem, S3Reveal } from "./scenes/Act1";
import { S4Solution, S5Proof } from "./scenes/Act2";
import { S6Features, S7CTA } from "./scenes/Act3";

const B = BOOST.bars;

/**
 * Les raccords sont gérés DANS les scènes (raccord par la forme, zoom traversant,
 * montée de vitesse, whip pan) : pas de fondu automatique entre les scènes (pad = 0).
 */
const SCENES: SceneDef[] = [
  { key: "hook", Component: S1Hook, duration: B.hook * BAR, enter: "none", exit: "none" },
  { key: "problem", Component: S2Problem, duration: B.problem * BAR, enter: "none", exit: "none" },
  { key: "reveal", Component: S3Reveal, duration: B.reveal * BAR, enter: "none", exit: "none" },
  { key: "solution", Component: S4Solution, duration: B.solution * BAR, enter: "none", exit: "none" },
  { key: "proof", Component: S5Proof, duration: B.proof * BAR, enter: "none", exit: "none" },
  { key: "features", Component: S6Features, duration: B.features * BAR, enter: "none", exit: "none" },
  { key: "cta", Component: S7CTA, duration: B.cta * BAR, enter: "none", exit: "none" },
];

export const PubBoost: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BOOST.black }}>
    <Background center={BOOST.background.center} edge={BOOST.background.edge} color={BOOST.accent} />
    <Camera>
      <SceneTimeline scenes={SCENES} pad={0} />
    </Camera>
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
    <Grain />
    {BOOST.music ? <Audio src={staticFile(BOOST.music)} /> : null}
  </AbsoluteFill>
);
