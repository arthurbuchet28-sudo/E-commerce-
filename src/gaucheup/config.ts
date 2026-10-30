/**
 * ─────────────────────────────────────────────────────────────
 *  VIDÉO D'ANNONCE GAUCHE'UP (9:16, 15 s) — tout se règle ici
 * ─────────────────────────────────────────────────────────────
 */
export const GU = {
  url: "gaucheup.fr",

  // Identité (relevée sur gaucheup.fr)
  colors: {
    red: "#E63946",
    cream: "#F7F5F0",
    beige: "#EBE7DD",
    ink: "#111111",
    blue: "#2C3E9E",
    green: "#2E7D4F",
    pink: "#F7C6D9",
    black: "#151515",
  },
  fonts: {
    display: "'Sour Gummy', 'Inter', sans-serif", // police des titres du site
    body: "'Inter', sans-serif",
  },

  // Textes
  hook: ["Ça penche…", "à gauche."],
  eyebrow: "Nouvelle marque",
  baseline: "Streetwear de gauche.",
  mosaic: ["4 t-shirts.", "+ 1 édition limitée."],
  launch: ["C'est", "lancé !"],
  launchSub: "La boutique est ouverte",
  linkHint: "lien en bio",

  // Les t-shirts (mockups dans public/gaucheup/tees/)
  tees: [
    {
      n: "N°01",
      name: "À gauche toute",
      caption: "Pas de demi-tour.",
      price: "dès 24,99 €",
      views: [
        { img: "agt-rouge", color: "red" },
        { img: "agt-bleu", color: "blue" },
        { img: "agt-vert", color: "green" },
      ],
      colorsLabel: "3 coloris",
    },
    {
      n: "N°02",
      name: "Le cauchemar",
      caption: "Rassure-toi, c'était un rêve.",
      price: "dès 24,99 €",
      views: [
        { img: "cauch-rouge", color: "red" },
        { img: "cauch-bleu", color: "blue" },
        { img: "cauch-vert", color: "green" },
      ],
      colorsLabel: "3 coloris",
    },
    {
      n: "N°03",
      name: "La République",
      caption: "La réplique culte.",
      price: "dès 24,99 €",
      views: [
        { img: "rep-rouge", color: "red" },
        { img: "rep-bleu", color: "blue" },
        { img: "rep-vert", color: "green" },
      ],
      colorsLabel: "3 coloris",
    },
    {
      n: "N°04",
      name: "RHAINE",
      caption: "Le programme en 5 lettres.",
      price: "dès 24,99 €",
      views: [
        { img: "rhaine", color: "red" },
        { img: "rhaine-porte", color: "red" },
        { img: "rhaine", color: "red" },
      ],
      colorsLabel: "Modèle unique",
    },
    {
      n: "Édition limitée",
      name: "Bismillah c'est les ténèbres !",
      caption: "Pour la tête de cortège.",
      price: "33,99 €",
      views: [
        { img: "bism-noir", color: "black" },
        { img: "bism-rose", color: "pink" },
        { img: "life-bism", color: "pink" },
      ],
      colorsLabel: "2 coloris",
      limited: true,
    },
  ],
  lifestyle: ["life-agt", "life-rep", "life-cauch", "life-bism", "life-rhaine", "life-agt2"],

  // Textures du logo sur l'écran de fin (une par temps, la dernière reste)
  logoTextures: ["original", "chrome", "leopard", "holo", "fire", "rose", "ocean", "original"],

  // Rythme : 1 temps = 28 frames à 60 fps (≈ 128,6 BPM). Durées des scènes en temps.
  beatFrames: 28,
  beats: { hook: 3, logo: 3, tee: 3, mosaic: 3, end: 8.143 },

  fps: 60,
  width: 1080,
  height: 1920,
} as const;

export const BEAT = GU.beatFrames;
export const bt = (n: number) => Math.round(n * BEAT);
export type ColorKey = keyof typeof GU.colors;

export const GU_SCENE_FRAMES = {
  hook: bt(GU.beats.hook),
  logo: bt(GU.beats.logo),
  tee: bt(GU.beats.tee),
  mosaic: bt(GU.beats.mosaic),
  end: bt(GU.beats.end),
};
export const GU_TOTAL_FRAMES =
  GU_SCENE_FRAMES.hook + GU_SCENE_FRAMES.logo + GU_SCENE_FRAMES.tee * GU.tees.length + GU_SCENE_FRAMES.mosaic + GU_SCENE_FRAMES.end;
