import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {easeOutQuint, fonts} from '../theme';

const reveal = (frame: number, start: number, duration: number, distance: number) => {
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutQuint,
  });
  return {opacity: p, transform: `translateY(${(1 - p) * distance}px)`};
};

type Props = {
  lines: readonly string[];
  start: number;
  size: number;
  color: string;
  weight?: number;
  // 'word' : mot par mot ; 'line' : ligne par ligne
  mode?: 'word' | 'line';
  stagger?: number;
  duration?: number;
  distance?: number;
  align?: 'left' | 'center';
  lineHeight?: number;
  style?: React.CSSProperties;
};

// Apparition mot par mot ou ligne par ligne : slide vertical (20–30 px) + fondu.
export const AnimatedText: React.FC<Props> = ({
  lines,
  start,
  size,
  color,
  weight = fonts.titre,
  mode = 'word',
  stagger = 3,
  duration = 18,
  distance = 26,
  align = 'left',
  lineHeight = 1.12,
  style,
}) => {
  const frame = useCurrentFrame();
  let index = 0;
  return (
    <div
      style={{
        fontFamily: fonts.family,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        color,
        textAlign: align,
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {lines.map((line, li) => {
        if (mode === 'line') {
          const s = reveal(frame, start + li * stagger, duration, distance);
          return (
            <div key={li} style={{...s, whiteSpace: 'nowrap'}}>
              {line}
            </div>
          );
        }
        // Les mots sont séparés sur les espaces normales uniquement : une espace
        // insécable (avant « ? » ou « : ») garde la ponctuation avec son mot.
        const words = line.split(' ');
        return (
          <div key={li} style={{whiteSpace: 'nowrap'}}>
            {words.map((w, wi) => {
              const s = reveal(frame, start + index++ * stagger, duration, distance);
              return (
                <span key={wi} style={{display: 'inline-block', ...s}}>
                  {w}
                  {wi < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
