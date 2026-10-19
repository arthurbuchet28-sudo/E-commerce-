import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, Grain } from "../../components/Background";
import { VICAT } from "../config";

/** Texture minérale fixe (béton lissé) : bruit fin + granulats plus larges, très discrets. */
const ConcreteTexture: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.16, mixBlendMode: "multiply" }}>
      <filter id="concreteFine">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={7} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope={0.9} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#concreteFine)" />
    </svg>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.1, mixBlendMode: "multiply" }}>
      <filter id="concreteCoarse">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={4} seed={3} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#concreteCoarse)" />
    </svg>
  </AbsoluteFill>
);

/** Fond Vicat : même fond animé que Promptly (dégradé + nébuleuses qui dérivent), version béton clair. */
export const Backdrop: React.FC = () => (
  <>
    <Background center={VICAT.background.center} edge={VICAT.background.edge} color={VICAT.accent} />
    <ConcreteTexture />
  </>
);

/** Grain + vignettage adaptés au fond clair. */
export const VicatGrain: React.FC = () => <Grain vignette="rgba(40, 46, 56, 0.22)" opacity={0.05} />;
