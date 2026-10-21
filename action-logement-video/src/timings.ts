// Toutes les durées de la vidéo. Le tempo de la musique sert d'unité :
// à 120 BPM / 30 fps, 1 temps = 15 images, 1 mesure (4 temps) = 60 images = 2 s.
// Chaque changement de scène tombe sur un temps, chaque carte de la scène 3
// sur une mesure. Pour viser 20 s ou 25 s, ajustez les nombres de temps
// ci-dessous (total actuel : 44 temps = 22 s).

export const FPS = 30;
export const BPM = 120;
export const BEAT = Math.round((60 / BPM) * FPS); // 15 images
export const BAR = BEAT * 4; // 60 images

export const beats = (n: number) => Math.round(n * BEAT);

export const scenes = {
  accroche: beats(6), // 0:00 → 0:03
  reponse: beats(8), // 0:03 → 0:07
  solutions: beats(16), // 0:07 → 0:15 (4 cartes × 1 mesure)
  entreprises: beats(8), // 0:15 → 0:19
  signature: beats(6), // 0:19 → 0:22
} as const;

export const TOTAL_FRAMES = Object.values(scenes).reduce((a, b) => a + b, 0);

// Wipe framboise entre scènes : moitié à la fin d'une scène, moitié au début
// de la suivante (0,5 s au total).
export const TRANSITION = 16;
export const HALF_TRANSITION = TRANSITION / 2;

// Durée d'une carte dans la scène 3
export const CARD_DURATION = scenes.solutions / 4;

// Audio
export const MUSIC_FADE_IN = Math.round(0.5 * FPS);
export const MUSIC_FADE_OUT = Math.round(1 * FPS);
export const MUSIC_VOLUME = 0.8;
