import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {IconName} from '../texts';
import {easeOutQuint} from '../theme';

// Pictogrammes originaux en traits simples (viewBox 120 × 120).
// Chaque tracé se dessine progressivement (stroke-dashoffset).
const shapes: Record<IconName, React.ReactNode[]> = {
  bouclier: [
    <path key="a" d="M60 14 L98 28 V58 C98 82 82 98 60 106 C38 98 22 82 22 58 V28 Z" />,
    <path key="b" d="M44 60 L56 72 L78 48" />,
  ],
  cle: [
    <circle key="a" cx="38" cy="60" r="20" />,
    <circle key="b" cx="38" cy="60" r="6" />,
    <path key="c" d="M58 60 H102" />,
    <path key="d" d="M88 60 V76" />,
    <path key="e" d="M100 60 V72" />,
  ],
  diplome: [
    <path key="a" d="M60 28 L106 48 L60 68 L14 48 Z" />,
    <path key="b" d="M32 57 V78 C32 90 88 90 88 78 V57" />,
    <path key="c" d="M106 48 V76" />,
  ],
  maison: [
    <path key="a" d="M18 58 L60 22 L102 58" />,
    <path key="b" d="M30 48 V98 H90 V48" />,
    <path key="c" d="M52 98 V76 C52 72 54 70 58 70 H62 C66 70 68 72 68 76 V98" />,
  ],
  mallette: [
    <rect key="a" x="16" y="40" width="88" height="58" rx="10" />,
    <path key="b" d="M44 40 V30 C44 26 47 24 51 24 H69 C73 24 76 26 76 30 V40" />,
    <path key="c" d="M16 64 H104" />,
    <rect key="d" x="53" y="57" width="14" height="14" rx="3" />,
  ],
  poignee: [
    <path key="a" d="M6 46 L26 38 L40 74 L20 82 Z" />,
    <path key="b" d="M114 46 L94 38 L80 74 L100 82 Z" />,
    <path key="c" d="M30 46 L52 38 C56 37 60 37 64 39 L90 46" />,
    <path key="d" d="M64 39 L48 54 C45 57 47 62 52 61 L66 52 L84 70" />,
    <path key="e" d="M38 70 L52 82 C55 85 59 84 61 81" />,
    <path key="f" d="M50 66 L62 78 C65 81 69 80 71 77" />,
    <path key="g" d="M62 62 L72 72 C75 75 79 74 80 71" />,
  ],
};

type Props = {
  name: IconName;
  size: number;
  color: string;
  start?: number; // image de début du tracé (relative à la séquence)
  duration?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

export const Icon: React.FC<Props> = ({
  name,
  size,
  color,
  start = 0,
  duration = 24,
  strokeWidth = 6,
  style,
}) => {
  const frame = useCurrentFrame();
  const parts = shapes[name];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      {parts.map((el, i) => {
        const s = start + (i * duration) / (parts.length * 2);
        const p = interpolate(frame, [s, s + duration * 0.7], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOutQuint,
        });
        return React.cloneElement(el as React.ReactElement, {
          fill: 'none',
          stroke: color,
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          pathLength: 1,
          strokeDasharray: 1,
          strokeDashoffset: 1 - p,
          opacity: p > 0 ? 1 : 0,
        });
      })}
    </svg>
  );
};
