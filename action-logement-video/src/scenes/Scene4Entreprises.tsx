import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {FloatingShapes} from '../components/FloatingShapes';
import {Icon} from '../components/Icons';
import {useLayout} from '../components/layout';
import type {IconName} from '../texts';
import {texts} from '../texts';
import {colors, easeOutQuint, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Schéma : mallette + poignée de main reliées à la maison par des lignes animées.
// Coordonnées dans un repère 700 × 560.
const NODES: {name: IconName; x: number; y: number; start: number}[] = [
  {name: 'mallette', x: 130, y: 120, start: 6},
  {name: 'poignee', x: 130, y: 440, start: 12},
  {name: 'maison', x: 570, y: 280, start: 44},
];
const LINKS = [
  {d: 'M 230 120 C 380 120 380 280 470 280', start: 24},
  {d: 'M 230 440 C 380 440 380 280 470 280', start: 28},
];

const Diagram: React.FC<{scale: number}> = ({scale}) => {
  const frame = useCurrentFrame();
  const r = 100;
  return (
    <div style={{position: 'relative', width: 700 * scale, height: 560 * scale}}>
      <svg width={700 * scale} height={560 * scale} viewBox="0 0 700 560" style={{position: 'absolute'}}>
        {LINKS.map((l, i) => {
          const p = interpolate(frame, [l.start, l.start + 18], [0, 1], {...clamp, easing: easeOutQuint});
          return (
            <path
              key={i}
              d={l.d}
              fill="none"
              stroke={colors.framboise}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
              opacity={p > 0 ? 1 : 0}
            />
          );
        })}
      </svg>
      {NODES.map((n) => {
        const isHouse = n.name === 'maison';
        const p = interpolate(frame, [n.start, n.start + 16], [0, 1], {...clamp, easing: easeOutQuint});
        return (
          <div
            key={n.name}
            style={{
              position: 'absolute',
              left: (n.x - r) * scale,
              top: (n.y - r) * scale,
              width: 2 * r * scale,
              height: 2 * r * scale,
              borderRadius: '50%',
              background: isHouse ? colors.framboise : colors.framboise10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: p,
              transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
            }}
          >
            <Icon
              name={n.name}
              size={120 * scale}
              color={isHouse ? colors.blanc : colors.framboise}
              start={n.start + 4}
              duration={20}
            />
          </div>
        );
      })}
    </div>
  );
};

export const Scene4Entreprises: React.FC = () => {
  const frame = useCurrentFrame();
  const {portrait, safe, unit} = useLayout();
  const bar = interpolate(frame, [52, 68], [0, 1], {...clamp, easing: easeOutQuint});
  return (
    <AbsoluteFill style={{background: colors.blanc}}>
      <FloatingShapes
        color={colors.framboise10}
        shapes={[
          {x: 0.93, y: 0.12, size: 150, kind: 'square', delay: 8},
          {x: 0.05, y: 0.12, size: 100, kind: 'circle', delay: 14},
        ]}
      />
      <AbsoluteFill
        style={{
          padding: `${safe.top}px ${safe.right}px ${safe.bottom}px ${safe.left}px`,
          display: 'flex',
          flexDirection: portrait ? 'column-reverse' : 'row',
          alignItems: portrait ? 'flex-start' : 'center',
          justifyContent: portrait ? 'flex-end' : 'space-between',
          gap: (portrait ? 110 : 60) * unit,
        }}
      >
        <div>
          <AnimatedText
            lines={texts.entreprises.titre}
            start={12}
            size={(portrait ? 88 : 84) * unit}
            color={colors.grisFonce}
          />
          <div style={{display: 'flex', alignItems: 'center', marginTop: 40 * unit, gap: 22 * unit}}>
            <div
              style={{
                width: 60 * unit * bar,
                height: 8 * unit,
                borderRadius: 4 * unit,
                background: colors.framboise,
              }}
            />
            <AnimatedText
              lines={[texts.entreprises.sousTitre]}
              start={54}
              mode="line"
              size={(portrait ? 48 : 46) * unit}
              weight={fonts.titreBold}
              color={colors.framboise}
            />
          </div>
        </div>
        <Diagram scale={(portrait ? 1.2 : 1.05) * unit} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
