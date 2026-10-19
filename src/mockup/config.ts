/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION DU MOCKUP « UNE MAIN LANCE LA PUB SUR UN MACBOOK »
 * ─────────────────────────────────────────────────────────────
 */
export const MOCKUP = {
  // Vidéo affichée à l'écran (dans public/) et sa durée réelle (vérifiée avec ffprobe)
  video: "pub-site.mp4",
  videoFrames: 1200, // 20 s à 60 fps
  videoLabel: "Promptly — Vos idées. En vidéo.",

  // Moments clés (secondes)
  timing: {
    handIn: 1.6, // la main entre dans le champ
    land: 2.6, // l'index se pose sur le trackpad
    slide: 2.9, // le doigt glisse, le curseur va vers ▶
    click: 3.5, // clic
    play: 3.8, // la vidéo démarre
    handOut: 3.75, // la main se retire
    pushIn: 6, // durée du rapprochement de la caméra après le clic
    endHold: 1.7, // tenue sur la dernière image après la fin de la vidéo
  },

  // Main
  skin: "#C8956D", // teinte de peau de base (les ombres/lumières en sont dérivées)
  sleeve: ["#1a1a22", "#0d0d12"],

  // Caméra (échelle du laptop = taille à l'écran)
  camera: {
    startScale: 0.6, // écran ≈ 45 % de la largeur de l'image
    closeScale: 0.95, // écran ≈ 70 % de la largeur
    endScale: 0.74, // recul final
    startRotateY: -16,
    closeRotateY: -8,
    rotateX: -16,
    lidTilt: 10,
  },

  // Bureau / ambiance
  desk: ["#15131c", "#0b0a10"],
  wall: "#07060b",
  lampColor: "#F59E0B",

  width: 1920,
  height: 1080,
  fps: 60,
} as const;

export const ms = (s: number) => Math.round(s * MOCKUP.fps);

/** Frames clés. */
export const T = {
  handIn: ms(MOCKUP.timing.handIn),
  land: ms(MOCKUP.timing.land),
  slide: ms(MOCKUP.timing.slide),
  click: ms(MOCKUP.timing.click),
  play: ms(MOCKUP.timing.play),
  handOut: ms(MOCKUP.timing.handOut),
  videoEnd: ms(MOCKUP.timing.play) + MOCKUP.videoFrames,
};

export const MOCKUP_TOTAL_FRAMES = T.videoEnd + ms(MOCKUP.timing.endHold);
