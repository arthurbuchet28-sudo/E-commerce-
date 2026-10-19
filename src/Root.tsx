import React from "react";
import { Composition } from "remotion";
import { CONFIG, TOTAL_FRAMES } from "./config";
import { waitForFonts } from "./fonts";
import { Pub } from "./Pub";

waitForFonts();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Pub"
    component={Pub}
    durationInFrames={TOTAL_FRAMES}
    fps={CONFIG.fps}
    width={CONFIG.width}
    height={CONFIG.height}
  />
);
