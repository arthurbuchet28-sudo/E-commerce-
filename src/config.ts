/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION DE LA PUB — tout ce qui se personnalise est ici
 * ─────────────────────────────────────────────────────────────
 */
export const CONFIG = {
  // Identité de l'app
  appName: "Pulse",
  tagline: "Chaque rep compte.",
  ctaLabel: "Télécharger Pulse",

  // Couleurs
  accent: "#3B82F6", // couleur d'accent (glow, boutons, graphiques)
  background: {
    center: "#0F1524", // centre du dégradé de fond
    edge: "#030305", // bords (presque noir)
  },

  // Police (Inter est embarquée via @fontsource, SF Pro en repli sur Mac)
  fontFamily:
    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",

  // Contenu des maquettes d'interface
  userName: "Alex",
  dateLabel: "Lundi 19 octobre",

  // Scène 3 : la carte clé avec le chiffre qui s'incrémente
  stat: {
    label: "Nouveau record",
    exercise: "Développé couché",
    value: 102.5,
    decimals: 1,
    unit: "kg",
    delta: "+7,5 kg en 6 semaines",
  },

  // Scène 4 : légendes des écrans qui défilent
  screens: [
    { title: "Séance en direct", subtitle: "Chaque série, chaque charge." },
    { title: "Progression", subtitle: "Vos courbes, en temps réel." },
    { title: "Régularité", subtitle: "Gardez la série vivante." },
  ],

  // Durées (en secondes) de chaque scène — la durée totale en découle
  durations: {
    intro: 3, // iPhone 3D qui arrive
    dive: 3, // plongée dans l'écran
    stat: 3, // carte clé + compteur
    screens: 3, // écrans en perspective
    outro: 3, // logo + bouton
  },
  // Durée des fondus enchaînés entre scènes (secondes)
  transition: 0.4,

  // Vidéo
  width: 1920,
  height: 1080,
  fps: 60,
} as const;

export type SceneKey = keyof typeof CONFIG.durations;

export const sec = (s: number) => Math.round(s * CONFIG.fps);

export const TOTAL_FRAMES = Object.values(CONFIG.durations).reduce(
  (acc, s) => acc + sec(s),
  0,
);
