/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION DE LA PUB « VIRALO » (visibilité TikTok) — tout se règle ici
 * ─────────────────────────────────────────────────────────────
 */
export const BOOST = {
  // Identité (site imaginaire, outil honnête : analyse, conseils, tendances, planification)
  siteName: "Viralo",
  url: "viralo.app",
  tagline: "Fais-toi voir.",
  ctaLabel: "Essayer gratuitement",

  // Couleurs (toute la palette en est dérivée)
  accent: "#FF6B35", // orange flamme
  accent2: "#FFD166", // ambre
  black: "#07060A", // noirs teintés
  background: { center: "#1A0F0B", edge: "#050407" },
  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",

  // Contenu (fictif)
  account: "@lea.cuisine",
  accountName: "Léa",
  accountBio: "Créatrice culinaire · 3,1 k abonnés",
  videoCaption: "Mes pâtes crémeuses en 15 s",
  viewsBefore: 214,
  viewsAfter: 1_200_000,
  followersGain: "+48 k abonnés",
  score: 92,
  recos: [
    { label: "Meilleure heure", value: "19 h 12" },
    { label: "Accroche à retravailler", value: "0-2 s" },
    { label: "Tendance détectée", value: "recette en 15 s" },
  ],
  notifications: [
    { kind: "like", text: "Sami a aimé ta vidéo" },
    { kind: "follow", text: "@hugo.eats te suit" },
    { kind: "comment", text: "Inès : trop bonne idée !" },
    { kind: "like", text: "Noah et 312 autres aiment" },
    { kind: "follow", text: "@chef.marie te suit" },
    { kind: "comment", text: "Jade : je teste ce soir" },
    { kind: "like", text: "Malik a aimé ta vidéo" },
    { kind: "follow", text: "@cuisine.facile te suit" },
  ],
  features: [
    { word: "Analyse", sub: "Ce qui marche, et pourquoi." },
    { word: "Tendances", sub: "Surfe dessus avant les autres." },
    { word: "Planification", sub: "Publie au meilleur moment." },
  ],
  hashtags: ["#recetterapide", "#cuisine", "#astuce", "#pâtes", "#15secondes", "#facile"],

  // Textes à l'écran (un mot-clé par phrase, mis en valeur)
  text: {
    hook1: ["Ta", "vidéo", "a", "fait"],
    problem: [{ w: "L'algorithme" }, { w: "ne te voit pas.", key: true }],
    reveal: [{ w: "Et" }, { w: "si" }, { w: "tout changeait", key: true }, { w: "?" }],
    solution: [{ w: "Ton compte," }, { w: "analysé par l'IA.", key: true }],
  },

  // Musique (générée par scripts/make-music-boost.py, calée sur ces mêmes repères)
  music: "boost-music.wav",

  // Rythme : 120 BPM → 1 temps = 30 frames à 60 fps, 1 mesure = 4 temps
  bpm: 120,
  fps: 60,
  // Durée de chaque scène, en mesures (le total fait 11 mesures = 22 s)
  bars: { hook: 1, problem: 1, reveal: 1, solution: 2, proof: 2, features: 2, cta: 2 },

  width: 1080,
  height: 1920,
} as const;

/** 1 temps en frames (30 à 120 BPM et 60 fps). */
export const BEAT = Math.round((60 / BOOST.bpm) * BOOST.fps);
export const BAR = BEAT * 4;
/** Convertit un nombre de temps en frames. */
export const beats = (n: number) => Math.round(n * BEAT);

export const BOOST_TOTAL_FRAMES = Object.values(BOOST.bars).reduce((a, b) => a + b * BAR, 0);
