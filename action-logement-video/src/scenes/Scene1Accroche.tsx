import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {FloatingShapes} from '../components/FloatingShapes';
import {useLayout} from '../components/layout';
import {texts} from '../texts';
import {colors, easeInOutCubic, easeOutQuint, softSpring} from '../theme';

// Carré arrondi → silhouette de maison (mêmes 5 points, interpolés)
const SQUARE = [
  [20, 180],
  [20, 20],
  [100, 20],
  [180, 20],
  [180, 180],
];
const HOUSE = [
  [36, 180],
  [36, 96],
  [100, 34],
  [164, 96],
  [164, 180],
];

const HouseMorph: React.FC<{size: number}> = ({size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: softSpring, durationInFrames: 22});
  const morph = interpolate(frame, [18, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const door = interpolate(frame, [32, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutQuint,
  });
  const points = SQUARE.map(([x, y], i) => {
    const [hx, hy] = HOUSE[i];
    return `${x + (hx - x) * morph},${y + (hy - y) * morph}`;
  }).join(' ');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{overflow: 'visible', transform: `translateX(${(enter - 1) * size * 2.2}px)`}}
    >
      <polygon
        points={points}
        fill={colors.framboise}
        stroke={colors.framboise}
        strokeWidth={22}
        strokeLinejoin="round"
      />
      <rect
        x={84}
        y={180 - 52 * door}
        width={32}
        height={52 * door}
        rx={8}
        fill={colors.blanc}
      />
    </svg>
  );
};

export const Scene1Accroche: React.FC = () => {
  const {portrait, safe, unit, innerWidth} = useLayout();
  const textSize = (portrait ? 78 : 88) * unit;
  return (
    <AbsoluteFill style={{background: colors.blanc}}>
      <FloatingShapes
        color={colors.framboise10}
        shapes={[
          {x: 0.9, y: 0.16, size: 180, kind: 'circle', delay: 6},
          {x: 0.82, y: 0.86, size: 120, kind: 'square', delay: 14},
          {x: 0.06, y: 0.9, size: 90, kind: 'circle', delay: 20},
        ]}
      />
      <AbsoluteFill
        style={{
          padding: `${safe.top}px ${safe.right}px ${safe.bottom}px ${safe.left}px`,
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          alignItems: portrait ? 'flex-start' : 'center',
          justifyContent: 'center',
          gap: (portrait ? 90 : 110) * unit,
        }}
      >
        <HouseMorph size={(portrait ? 300 : 340) * unit} />
        <div style={{maxWidth: innerWidth}}>
          <AnimatedText
            lines={texts.accroche.ligne1}
            start={10}
            size={textSize}
            color={colors.grisFonce}
          />
          <AnimatedText
            lines={[texts.accroche.ligne2]}
            start={36}
            stagger={4}
            size={textSize}
            color={colors.framboise}
            style={{marginTop: 14 * unit}}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
