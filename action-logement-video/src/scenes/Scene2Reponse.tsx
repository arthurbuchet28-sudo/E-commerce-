import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {FloatingShapes} from '../components/FloatingShapes';
import {Logo} from '../components/Logo';
import {useLayout} from '../components/layout';
import {texts} from '../texts';
import {colors, easeInOutCubic, easeOutQuint, fonts} from '../theme';

export const Scene2Reponse: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, portrait, safe, unit} = useLayout();

  // Logo blanc : fondu + scale 0.92 → 1 au centre, puis se rétracte en haut à gauche
  // Le logo est ancré par son centre au milieu de l'écran, puis par son coin
  // haut-gauche sur la marge de sécurité (taille réelle du SVG non requise).
  const logoW = (portrait ? 620 : 560) * unit;
  const appear = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutQuint,
  });
  const move = interpolate(frame, [36, 56], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const scale = interpolate(appear, [0, 1], [0.92, 1]) * interpolate(move, [0, 1], [1, 0.5]);
  const anchor = 50 * (1 - move);
  const left = interpolate(move, [0, 1], [width / 2, safe.left - logoW * 0.04]);
  const top = interpolate(move, [0, 1], [height / 2, safe.top - logoW * 0.04]);

  const bar = interpolate(frame, [64, 82], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutQuint,
  });

  return (
    <AbsoluteFill style={{background: colors.framboise}}>
      <FloatingShapes
        color={colors.blanc15}
        shapes={[
          {x: 0.88, y: 0.2, size: 260, kind: 'circle', delay: 4},
          {x: 0.78, y: 0.78, size: 160, kind: 'square', delay: 10},
          {x: 0.12, y: 0.84, size: 110, kind: 'circle', delay: 16},
        ]}
      />
      <div style={{position: 'absolute', left, top}}>
        <div
          style={{
            transform: `translate(${-anchor}%, ${-anchor}%) scale(${scale})`,
            transformOrigin: `${anchor}% ${anchor}%`,
            opacity: appear,
          }}
        >
          <Logo variant="blanc" width={logoW} />
        </div>
      </div>
      {frame >= 44 && (
        <AbsoluteFill
          style={{
            padding: `${safe.top}px ${safe.right}px ${safe.bottom}px ${safe.left}px`,
            justifyContent: 'center',
          }}
        >
          <div style={{marginTop: (portrait ? 120 : 90) * unit}}>
            <AnimatedText
              lines={texts.reponse.titre}
              start={48}
              mode="line"
              stagger={6}
              size={(portrait ? 92 : 104) * unit}
              color={colors.blanc}
            />
            <div
              style={{
                width: 140 * unit * bar,
                height: 8 * unit,
                borderRadius: 4 * unit,
                background: colors.blanc,
                margin: `${36 * unit}px 0 ${30 * unit}px`,
              }}
            />
            <AnimatedText
              lines={[texts.reponse.sousTitre]}
              start={68}
              mode="line"
              size={(portrait ? 42 : 46) * unit}
              weight={fonts.texte}
              color={colors.blanc}
              style={{whiteSpace: portrait ? 'normal' : 'nowrap'}}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
