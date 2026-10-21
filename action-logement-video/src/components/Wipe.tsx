import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, easeInOutCubic} from '../theme';
import {TRANSITION} from '../timings';

// Transition entre scènes : deux bandes pleine largeur (framboise puis
// framboise claire) balaient l'écran de gauche à droite. L'écran est
// entièrement couvert au milieu de la transition, moment où la scène change.
export const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const band = (delay: number) => {
    const t = interpolate(frame, [delay, delay + TRANSITION - 4], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeInOutCubic,
    });
    // -100 % → 0 (couvre) → +100 % (découvre)
    return `translateX(${interpolate(t, [0, 1], [-100, 100])}%)`;
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: colors.framboise15, transform: band(0)}} />
      <AbsoluteFill style={{background: colors.framboise, transform: band(2)}} />
    </AbsoluteFill>
  );
};
