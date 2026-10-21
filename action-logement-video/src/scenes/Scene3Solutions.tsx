import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Icon} from '../components/Icons';
import {useLayout} from '../components/layout';
import {texts} from '../texts';
import {colors, easeInOutCubic, fonts} from '../theme';
import {CARD_DURATION} from '../timings';

const cards = texts.solutions.cartes;
// Le glissement commence juste avant la mesure pour que la carte suivante
// soit active pile sur le temps fort.
const SLIDE = 14;
const SLIDE_LEAD = 6;

export const Scene3Solutions: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, portrait, safe, unit} = useLayout();

  // Position continue du carrousel (0 → 3)
  let pos = 0;
  for (let k = 1; k < cards.length; k++) {
    const s = k * CARD_DURATION - SLIDE_LEAD;
    pos += interpolate(frame, [s, s + SLIDE], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeInOutCubic,
    });
  }

  const cardW = (portrait ? 760 : 540) * unit;
  const cardH = (portrait ? 1100 : 600) * unit;
  const gap = (portrait ? 70 : 44) * unit;
  const sideScale = 0.88;
  const spacing = cardW * (1 + sideScale) / 2 + gap;
  // En 9:16 les cartes voisines sortent du cadre : leur texte est masqué
  // pour qu'aucun mot n'apparaisse coupé.
  const sideTextOpacity = portrait ? 0 : 0.55;

  const centerY = portrait
    ? safe.top + 170 * unit + cardH / 2
    : height / 2 + 50 * unit;

  return (
    <AbsoluteFill style={{background: colors.fondClair}}>
      <div style={{position: 'absolute', left: safe.left, top: safe.top}}>
        <AnimatedText
          lines={[texts.solutions.surtitre]}
          start={8}
          mode="line"
          size={(portrait ? 54 : 50) * unit}
          color={colors.framboise}
        />
      </div>

      {cards.map((card, i) => {
        const d = i - pos;
        const active = interpolate(Math.abs(d), [0, 1], [1, 0], {extrapolateRight: 'clamp'});
        const scale = interpolate(active, [0, 1], [sideScale, 1]);
        const x = width / 2 + d * spacing - cardW / 2;
        const ink = interpolateColors(active, [0, 1], [colors.grisFonce, colors.blanc]);
        const iconColor = interpolateColors(active, [0, 1], [colors.framboise, colors.blanc]);
        // Apparition initiale des cartes (glissement depuis la droite)
        const intro = interpolate(frame, [6 + i * 3, 26 + i * 3], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeInOutCubic,
        });
        const textOpacity = interpolate(active, [0, 1], [sideTextOpacity, 1]);
        // Seules la carte active et ses voisines directes sont visibles :
        // aucune carte n'apparaît tronquée par le bord du cadre.
        const visible = interpolate(Math.abs(d), [1, 1.5], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={card.titre}
            style={{
              position: 'absolute',
              left: x + intro * width * 0.6,
              top: centerY - cardH / 2,
              width: cardW,
              height: cardH,
              boxSizing: 'border-box',
              transform: `scale(${scale})`,
              background: interpolateColors(active, [0, 1], [colors.blanc, colors.framboise]),
              border: `${4 * unit}px solid ${colors.framboise}`,
              borderRadius: 40 * unit,
              padding: `${(portrait ? 80 : 56) * unit}px ${(portrait ? 64 : 44) * unit}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              opacity: (1 - intro) * visible,
            }}
          >
            <Icon
              style={{opacity: portrait ? textOpacity : 1}}
              name={card.icone}
              size={(portrait ? 230 : 150) * unit}
              color={iconColor}
              start={14 + i * 4}
              strokeWidth={6}
            />
            <div style={{opacity: textOpacity, marginTop: 'auto'}}>
              <div
                style={{
                  fontFamily: fonts.family,
                  fontWeight: fonts.titre,
                  fontSize: (portrait ? 58 : 42) * unit,
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  color: ink,
                }}
              >
                {card.titre}
              </div>
              <div
                style={{
                  fontFamily: fonts.family,
                  fontWeight: fonts.texte,
                  fontSize: (portrait ? 46 : 34) * unit,
                  lineHeight: 1.3,
                  color: ink,
                  marginTop: 20 * unit,
                }}
              >
                {card.texte}
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicateur de progression */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: centerY + cardH / 2 + (portrait ? 70 : 50) * unit,
          display: 'flex',
          justifyContent: 'center',
          gap: 16 * unit,
          opacity: interpolate(frame, [20, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        {cards.map((c, i) => {
          const a = interpolate(Math.abs(i - pos), [0, 1], [1, 0], {extrapolateRight: 'clamp'});
          return (
            <div
              key={c.titre}
              style={{
                width: (16 + 40 * a) * unit,
                height: 16 * unit,
                borderRadius: 8 * unit,
                background: interpolateColors(a, [0, 1], [colors.framboise15, colors.framboise]),
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
