import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Grain } from "./components/Background";
import { CONFIG, sec, SceneKey } from "./config";
import { SceneProvider } from "./lib/scene";
import { ease } from "./lib/utils";
import { Scene1Phone } from "./scenes/Scene1Phone";
import { Scene2Dive } from "./scenes/Scene2Dive";
import { Scene3Stat } from "./scenes/Scene3Stat";
import { Scene4Screens } from "./scenes/Scene4Screens";
import { Scene5Logo } from "./scenes/Scene5Logo";

type TransitionStyle = "none" | "dissolve" | "blur";

/** Ordre des scènes et style des fondus enchaînés. */
const SCENES: { key: SceneKey; Component: React.FC; enter: TransitionStyle; exit: TransitionStyle }[] = [
  { key: "intro", Component: Scene1Phone, enter: "none", exit: "dissolve" },
  { key: "dive", Component: Scene2Dive, enter: "dissolve", exit: "blur" },
  { key: "stat", Component: Scene3Stat, enter: "blur", exit: "blur" },
  { key: "screens", Component: Scene4Screens, enter: "blur", exit: "dissolve" },
  { key: "outro", Component: Scene5Logo, enter: "dissolve", exit: "none" },
];

const PAD = Math.round(sec(CONFIG.transition) / 2);

/** Gère l'entrée/sortie d'une scène : fondu, flou et léger zoom (jamais de coupe sèche). */
const SceneSlot: React.FC<{
  start: number;
  duration: number;
  padIn: number;
  enter: TransitionStyle;
  exit: TransitionStyle;
  children: React.ReactNode;
}> = ({ start, duration, padIn, enter, exit, children }) => {
  const seqFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = seqFrame - padIn;
  const opt = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut } as const;

  const e = enter === "none" ? 1 : interpolate(frame, [-PAD, PAD], [0, 1], opt);
  const x = exit === "none" ? 0 : interpolate(frame, [duration - PAD, duration + PAD], [0, 1], opt);

  let opacity = e * (1 - interpolate(x, [0.35, 1], [0, 1]));
  let blur = 0;
  let scale = 1;
  if (enter === "blur") {
    blur += (1 - e) * 16;
    scale *= 1.08 - 0.08 * e;
  }
  if (exit === "blur") {
    blur += x * 16;
    scale *= 1 - 0.06 * x;
  }
  if (exit === "dissolve" && enter !== "none") opacity = e * (1 - x);

  return (
    <SceneProvider value={{ frame, duration, absFrame: start + frame, fps }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </SceneProvider>
  );
};

/** Caméra globale : léger zoom et rotation permanents sur toute la pub. */
const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const rot = Math.sin(t * 0.35) * 0.7;
  const dx = Math.sin(t * 0.25) * 10;
  const dy = Math.cos(t * 0.3) * 6;
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${zoom}) rotate(${rot}deg)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Pub: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.background.edge }}>
      <Background />
      <Camera>
        {SCENES.map(({ key, Component, enter, exit }, i) => {
          const duration = sec(CONFIG.durations[key]);
          const start = cursor;
          cursor += duration;
          const padIn = i === 0 ? 0 : PAD;
          const padOut = i === SCENES.length - 1 ? 0 : PAD;
          return (
            <Sequence key={key} name={key} from={start - padIn} durationInFrames={duration + padIn + padOut}>
              <SceneSlot start={start} duration={duration} padIn={padIn} enter={enter} exit={exit}>
                <Component />
              </SceneSlot>
            </Sequence>
          );
        })}
      </Camera>
      <Grain />
    </AbsoluteFill>
  );
};
