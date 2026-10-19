/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION DE LA PUB « SITE VIDÉO IA » — tout se règle ici
 * ─────────────────────────────────────────────────────────────
 */
export const SITE = {
  // Identité
  siteName: "Promptly",
  tagline: "Vos idées. En vidéo.",
  ctaLabel: "Commencer gratuitement",
  url: "promptly.studio",

  // Couleurs (toute la palette en est dérivée)
  accent: "#8B5CF6", // violet électrique : glow, boutons, traînées
  accent2: "#22D3EE", // cyan : dégradés, particules
  background: {
    center: "#120F24",
    edge: "#030305",
  },

  fontFamily:
    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",

  // Landing page (scène 1)
  heroTitle: ["Créez des vidéos IA", "dignes du cinéma"],
  heroSubtitle: "Prompts, génération, montage, animation : la méthode complète, pas à pas.",

  // Scène 3 : prompt tapé à l'écran
  prompt: "Un astronaute surfe sur une vague de néon, plan large, lumière dorée",
  generateLabel: "Générer",
  readyLabel: "Prête en 12 s",

  // Scène 4 : chiffre clé
  stat: {
    value: 12400,
    label: "créateurs formés",
    suffix: "",
    eyebrow: "Communauté",
    mini: ["120 leçons", "4,9", "Certificat inclus"],
  },

  // Scène 5 : légendes des écrans
  screens: [
    { title: "Apprenez", subtitle: "Des leçons courtes, concrètes." },
    { title: "Créez", subtitle: "Montez vos plans générés." },
    { title: "Partagez", subtitle: "Publiez, recevez des retours." },
  ],

  // Durées (secondes) — la durée totale en découle
  durations: {
    intro: 3,
    dive: 3.5,
    generate: 3.5,
    stat: 3.5,
    screens: 3,
    outro: 3.5,
  },
  transition: 0.4,

  width: 1920,
  height: 1080,
  fps: 60,
} as const;

export const ssec = (s: number) => Math.round(s * SITE.fps);

export const SITE_TOTAL_FRAMES = Object.values(SITE.durations).reduce((acc, s) => acc + ssec(s), 0);
