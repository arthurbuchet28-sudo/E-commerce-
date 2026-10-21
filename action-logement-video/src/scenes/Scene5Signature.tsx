import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Logo} from '../components/Logo';
import {useLayout} from '../components/layout';
import {texts} from '../texts';
import {colors, easeInOutCubic, easeOutQuint, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Formes qui convergent vers le centre (positions relatives à l'écran)
const SHAPES = [
  {x: 0.08, y: 0.15, size: 120, kind: 'circle', color: colors.framboise},
  {x: 0.92, y: 0.2, size: 160, kind: 'square', color: colors.framboise15},
  {x: 0.85, y: 0.88, size: 110, kind: 'circle', color: colors.framboise15},
  {x: 0.15, y: 0.82, size: 140, kind: 'square', color: colors.framboise},
  {x: 0.5, y: 0.04, size: 70, kind: 'circle', color: colors.framboise},
  {x: 0.5, y: 0.96, size: 80, kind: 'square', color: colors.framboise15},
] as const;

// Tout est en place à l'image 30 : l'écran final tient ensuite 2 s, immobile.
export const Scene5Signature: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, portrait, safe, unit} = useLayout();
  const converge = interpolate(frame, [2, 20], [0, 1], {...clamp, easing: easeInOutCubic});
  const logo = interpolate(frame, [12, 28], [0, 1], {...clamp, easing: easeOutQuint});
  return (
    <AbsoluteFill style={{background: colors.blanc}}>
      {SHAPES.map((s, i) => {
        const size = s.size * unit * (1 - converge);
        const x = interpolate(converge, [0, 1], [s.x * width, width / 2]);
        const y = interpolate(converge, [0, 1], [s.y * height, height / 2]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              background: s.color,
              borderRadius: s.kind === 'circle' ? '50%' : size * 0.22,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          padding: `${safe.top}px ${safe.right}px ${safe.bottom}px ${safe.left}px`,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.92, 1])})`}}>
          <Logo variant="couleur" width={(portrait ? 640 : 600) * unit} />
        </div>
        <AnimatedText
          lines={portrait ? texts.signature.baselineLignes : [texts.signature.baseline]}
          start={16}
          duration={12}
          stagger={2}
          mode="line"
          align="center"
          size={(portrait ? 50 : 44) * unit}
          weight={fonts.titreBold}
          color={colors.grisFonce}
          style={{marginTop: 24 * unit}}
        />
        <AnimatedText
          lines={[texts.signature.url]}
          start={18}
          duration={12}
          mode="line"
          align="center"
          size={(portrait ? 46 : 40) * unit}
          weight={fonts.titreBold}
          color={colors.framboise}
          style={{marginTop: 28 * unit}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
