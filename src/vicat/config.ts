/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION DE LA VIDÉO « VICAT BÉTON » — tout se règle ici
 * ─────────────────────────────────────────────────────────────
 *  Mêmes moteurs que la pub Promptly (src/site) : fondus, caméra,
 *  traînées de lumière, flou de mouvement. Seuls textes, couleurs
 *  et logo changent. Contenus issus de vicat.fr.
 */
export const VICAT = {
  // Couleurs : le bleu est celui du SVG officiel (public/logo-vicat-bleu.svg)
  accent: "#004587", // bleu Vicat
  concrete: "#A39F96", // gris béton (particules, détails)
  text: "#2A2E33", // anthracite
  background: {
    center: "#F6F5F2", // blanc cassé minéral
    edge: "#D3D0C9", // gris béton clair
  },

  // Musique originale (générée par scripts/make-music-vicat.py, calée sur les durées ci-dessous)
  music: "vicat-music.wav",
  musicVolume: 1,

  fontFamily:
    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",

  // Scène 1
  introCaption: "Bétons · Ciments · Granulats",

  // Scène 2 : accroche officielle
  hook: ["Bâtir le futur,", "décarboner le présent."],

  // Scène 3 : l'offre
  offer: {
    title: "Le béton prêt à l'emploi,",
    subtitle: "sur-mesure pour chaque chantier",
    ranges: ["Classiques", "Décoratifs", "Spécifiques"],
  },

  // Scène 4 : bas carbone (nom de gamme mis en bleu)
  carbon: [
    { before: "Bas carbone avec ", brand: "DECA." },
    { before: "Recyclé avec ", brand: "REVY." },
  ],

  // Scène 5 : services
  services: ["Formulation", "Pompage", "Centrale mobile", "Livraison"],

  // Scène 6 : chiffre clé
  stat: { value: 200, suffix: "+", label: "implantations en France" },

  // Scène 7
  question: "Besoin de béton pour votre chantier ?",
  url: "vicat.fr",

  // Durées (secondes) — la durée totale en découle (23 s)
  durations: {
    intro: 3,
    hook: 3.5,
    offer: 4,
    carbon: 3.5,
    services: 3.5,
    stat: 2.5,
    outro: 3,
  },
  transition: 0.4,

  width: 1920,
  height: 1080,
  fps: 60,
} as const;

export const vsec = (s: number) => Math.round(s * VICAT.fps);

export const VICAT_TOTAL_FRAMES = Object.values(VICAT.durations).reduce((acc, s) => acc + vsec(s), 0);
