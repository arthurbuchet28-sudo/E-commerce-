import React from 'react';
import {Img, staticFile} from 'remotion';
import {assetsManifest} from '../assetsManifest';
import {fonts} from '../theme';

type Props = {
  variant: 'couleur' | 'blanc';
  width: number;
  style?: React.CSSProperties;
};

// Logo officiel uniquement (assets/logo-action-logement*.svg), jamais redessiné.
// Proportions conservées (height: auto), aucun filtre / ombre / contour.
// Seuls l'opacité, le scale uniforme et la position peuvent être animés
// par le parent. Si le fichier n'est pas encore fourni, un emplacement
// réservé neutre est affiché à la place.
export const Logo: React.FC<Props> = ({variant, width, style}) => {
  const available = variant === 'couleur' ? assetsManifest.logoCouleur : assetsManifest.logoBlanc;
  const file = variant === 'couleur' ? 'logo-action-logement.svg' : 'logo-action-logement-blanc.svg';
  // Zone de protection : marge interne autour du logo
  const padding = width * 0.08;

  if (available) {
    return (
      <div style={{padding, ...style}}>
        <Img src={staticFile(file)} style={{width, height: 'auto', display: 'block'}} />
      </div>
    );
  }

  const ink = variant === 'couleur' ? '#494C4F' : '#FFFFFF';
  return (
    <div style={{padding, ...style}}>
      <div
        style={{
          width,
          height: width * 0.42,
          border: `${Math.max(2, width * 0.006)}px dashed ${ink}`,
          borderRadius: width * 0.03,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: ink,
          fontFamily: fonts.family,
          textAlign: 'center',
          opacity: 0.85,
        }}
      >
        <div style={{fontWeight: 800, fontSize: width * 0.075}}>LOGO OFFICIEL</div>
        <div style={{fontWeight: 500, fontSize: width * 0.045, marginTop: width * 0.015}}>
          {file}
        </div>
      </div>
    </div>
  );
};
