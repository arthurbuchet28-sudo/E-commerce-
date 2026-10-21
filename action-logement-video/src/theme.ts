import {Easing} from 'remotion';

// ⚠️ Valeurs de travail : à remplacer par les codes exacts de la charte
// graphique officielle Action Logement (service communication).
export const colors = {
  framboise: '#ED2156',
  grisFonce: '#494C4F',
  blanc: '#FFFFFF',
  fondClair: '#F6F6F7',
  // Déclinaisons autorisées : framboise à 10–15 % pour les formes de fond
  framboise10: 'rgba(237, 33, 86, 0.10)',
  framboise15: 'rgba(237, 33, 86, 0.15)',
  blanc15: 'rgba(255, 255, 255, 0.15)',
} as const;

// Montserrat (embarquée via @fontsource, voir fonts.ts) par défaut ; une police
// de charte déposée dans assets/fonts/ est chargée sous le nom "Charte"
// et prend le dessus.
export const fonts = {
  family: 'Charte, Montserrat, sans-serif',
  titre: 800,
  titreBold: 700,
  texte: 500,
} as const;

// Easing principal : easeOutQuint, cubic-bezier(0.22, 1, 0.36, 1)
export const easeOutQuint = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOutCubic = Easing.bezier(0.65, 0, 0.35, 1);

// Spring "doux" sans rebond
export const softSpring = {damping: 200, mass: 0.6, stiffness: 120} as const;
