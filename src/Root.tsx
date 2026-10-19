import React from "react";
import { Composition } from "remotion";
import { CONFIG, TOTAL_FRAMES } from "./config";
import { waitForFonts } from "./fonts";
import { Pub } from "./Pub";
import { SITE, SITE_TOTAL_FRAMES } from "./site/config";
import { PubSite } from "./site/PubSite";

waitForFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Pub" component={Pub} durationInFrames={TOTAL_FRAMES} fps={CONFIG.fps} width={CONFIG.width} height={CONFIG.height} />
    <Composition
      id="PubSite"
      component={PubSite}
      durationInFrames={SITE_TOTAL_FRAMES}
      fps={SITE.fps}
      width={SITE.width}
      height={SITE.height}
    />
    {/* Version TikTok / Reels / Shorts : 9:16 */}
    <Composition
      id="PubSiteVertical"
      component={PubSite}
      durationInFrames={SITE_TOTAL_FRAMES}
      fps={SITE.fps}
      width={SITE.height}
      height={SITE.width}
    />
  </>
);
