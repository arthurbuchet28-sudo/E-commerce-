import confetti from 'canvas-confetti';

const COULEURS = ['#facc15', '#ec4899', '#8b5cf6', '#22d3ee', '#34d399', '#fb923c'];

export function animationsReduitesSysteme(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

type OptionsCelebration = {
  /** Point d'origine, en fraction de l'écran (0 → 1). */
  origine?: { x: number; y: number };
  /** Série en cours (plus elle est longue, plus c'est spectaculaire). */
  serie: number;
  /** Rapidité de la réponse entre 0 (lente) et 1 (instantanée). */
  rapidite: number;
  reduit: boolean;
};

/** Confettis de bonne réponse, plus abondants si la réponse est rapide ou la série longue. */
export function celebrerBonneReponse({ origine = { x: 0.5, y: 0.6 }, serie, rapidite, reduit }: OptionsCelebration) {
  if (reduit) return;
  const quantite = Math.round(40 + rapidite * 60 + Math.min(serie, 10) * 12);
  void confetti({ particleCount: quantite, spread: 70 + serie * 4, startVelocity: 35, origin: origine, colors: COULEURS, scalar: 0.9, disableForReducedMotion: true });
  if (serie >= 5) {
    void confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COULEURS, disableForReducedMotion: true });
    void confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COULEURS, disableForReducedMotion: true });
  }
  if (serie >= 10) {
    void confetti({ particleCount: 120, spread: 160, startVelocity: 55, origin: { x: 0.5, y: 0.35 }, shapes: ['star'], colors: ['#facc15', '#fde047', '#fb923c'], scalar: 1.3, disableForReducedMotion: true });
  }
}

/** Pluie de confettis de fin de partie (et feu d'artifice si record). */
export function celebrerFinDePartie(record: boolean, reduit: boolean): () => void {
  if (reduit) return () => {};
  void confetti({ particleCount: 140, spread: 100, origin: { y: 0.5 }, colors: COULEURS, disableForReducedMotion: true });
  if (!record) return () => {};
  const fin = Date.now() + 3500;
  const minuteur = window.setInterval(() => {
    if (Date.now() > fin) return window.clearInterval(minuteur);
    for (let i = 0; i < 2; i++) {
      void confetti({
        particleCount: 45,
        startVelocity: 30,
        spread: 360,
        ticks: 70,
        gravity: 0.8,
        origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 + 0.05 },
        colors: COULEURS,
        shapes: ['star', 'circle'],
        disableForReducedMotion: true,
      });
    }
  }, 280);
  return () => window.clearInterval(minuteur);
}

/** Vibration légère sur mobile, si l'appareil et les réglages le permettent. */
export function vibrer(motif: number | number[], actif: boolean) {
  if (!actif || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(motif);
  } catch {
    /* ignoré */
  }
}
