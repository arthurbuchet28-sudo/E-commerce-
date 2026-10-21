import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {useLayout} from './layout';

type Shape = {x: number; y: number; size: number; kind: 'circle' | 'square'; delay: number};

// Formes géométriques de fond (carrés arrondis, cercles) à 10–15 % d'opacité,
// avec une dérive lente pour garder de la vie à l'image.
export const FloatingShapes: React.FC<{color: string; shapes: Shape[]}> = ({color, shapes}) => {
  const frame = useCurrentFrame();
  const {width, height, unit} = useLayout();
  return (
    <AbsoluteFill>
      {shapes.map((s, i) => {
        const p = interpolate(frame, [s.delay, s.delay + 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const drift = Math.sin((frame + i * 40) / 45) * 10 * unit;
        const size = s.size * unit;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x * width - size / 2,
              top: s.y * height - size / 2 + drift,
              width: size,
              height: size,
              background: color,
              borderRadius: s.kind === 'circle' ? '50%' : size * 0.22,
              transform: `scale(${p}) rotate(${s.kind === 'square' ? 12 : 0}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
