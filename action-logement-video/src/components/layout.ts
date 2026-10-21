import {useVideoConfig} from 'remotion';

// Safe zones : 8 % minimum sur tous les bords ; en 9:16, le bas réserve 15 %
// à l'interface des réseaux sociaux (aucun texte dans cette zone).
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const safe = {
    top: Math.round(height * 0.08),
    bottom: Math.round(height * (portrait ? 0.15 : 0.08)),
    left: Math.round(width * 0.08),
    right: Math.round(width * 0.08),
  };
  return {
    width,
    height,
    portrait,
    safe,
    innerWidth: width - safe.left - safe.right,
    innerHeight: height - safe.top - safe.bottom,
    // Échelle typographique commune aux deux formats
    unit: portrait ? width / 1080 : height / 1080,
  };
};
