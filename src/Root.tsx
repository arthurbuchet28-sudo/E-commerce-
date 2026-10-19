import React from "react";
import { Composition } from "remotion";
import { CONFIG, TOTAL_FRAMES } from "./config";
import { waitForFonts } from "./fonts";
import { Pub } from "./Pub";
import { SITE, SITE_TOTAL_FRAMES } from "./site/config";
import { PubSite } from "./site/PubSite";
import { MOCKUP, MOCKUP_TOTAL_FRAMES } from "./mockup/config";
import { PubMockup } from "./mockup/PubMockup";

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
    {/* Mockup : une main lance la pub sur un MacBook */}
    <Composition
      id="PubMockup"
      component={PubMockup}
      durationInFrames={MOCKUP_TOTAL_FRAMES}
      fps={MOCKUP.fps}
      width={MOCKUP.width}
      height={MOCKUP.height}
    />
  </>
);
