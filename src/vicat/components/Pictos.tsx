import React from "react";

/** Pictos au trait, même grammaire que les icônes Promptly (viewBox 24, traits arrondis). */
type PictoProps = { size?: number; color?: string; stroke?: number; draw?: number };

const Svg: React.FC<PictoProps & { children: React.ReactNode }> = ({ size = 48, color = "#fff", stroke = 1.6, draw = 1, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {/* draw < 1 : les traits se dessinent */}
    <g style={draw < 1 ? { strokeDasharray: 60, strokeDashoffset: 60 * (1 - draw) } : undefined}>{children}</g>
  </svg>
);

/** Toupie béton (camion malaxeur). */
export const PictoToupie: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M1.8 17.2V12.5l1.8-3.2h3.2v7.9" />
    <path d="M3.6 9.3v2.9h3.2" />
    <path d="M6.8 13.6l10.8-5.9a2.7 2.7 0 0 1 3.9 2.9l-1.2 4.4H8.6z" />
    <path d="M12 8.9l1.6 6.1M15.2 7.6l1.4 7.4" />
    <path d="M1.8 17.2h20.4" />
    <circle cx="5.2" cy="18.6" r="1.6" />
    <circle cx="15.6" cy="18.6" r="1.6" />
    <circle cx="19.4" cy="18.6" r="1.6" />
  </Svg>
);

/** Camion pompe à flèche articulée. */
export const PictoPompe: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M2 17.2h14.5v-3.6H2z" />
    <path d="M16.5 13.6h2.8l2.7 2.6v1h-5.5" />
    <path d="M5 13.6l3.6-6.4 7.9-2.6 4.3 3.2" />
    <path d="M20.8 7.8v4" />
    <circle cx="8.6" cy="7.2" r="0.9" />
    <circle cx="5" cy="18.8" r="1.5" />
    <circle cx="13.5" cy="18.8" r="1.5" />
    <circle cx="18.6" cy="18.8" r="1.5" />
  </Svg>
);

/** Centrale à béton (silo + trémie + bâtiment). */
export const PictoCentrale: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M2 21h20" />
    <path d="M4 21V7.5l2.5-2 2.5 2V21" />
    <path d="M4 10.5h5M4 14h5" />
    <path d="M9 9.5h6l-1.5 3.5h-3z" />
    <path d="M12 13v2" />
    <path d="M11 21v-6h9v6" />
    <path d="M14 21v-2.5h3V21" />
  </Svg>
);

/** Formulation (fiole de laboratoire). */
export const PictoFormulation: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v6.2l-5.3 9.2A1.8 1.8 0 0 0 6.3 21h11.4a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3" />
    <path d="M7.4 15h9.2" />
    <circle cx="10.5" cy="18" r="0.6" />
    <circle cx="13.6" cy="17.2" r="0.6" />
  </Svg>
);

/** Bâtiment en chantier. */
export const PictoBatiment: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M2 21h20" />
    <path d="M4.5 21V8.5l7.5-4 7.5 4V21" />
    <path d="M8.5 11h2M13.5 11h2M8.5 14.5h2M13.5 14.5h2" />
    <path d="M10.5 21v-3.5h3V21" />
  </Svg>
);

/** Feuille (bas carbone). */
export const PictoFeuille: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M5 19.5C4.6 10.8 9.6 5 19.5 4.5 20 14.4 14.2 19.4 5.5 19z" />
    <path d="M5 19.5l9-9" />
    <path d="M9.5 15h4M9.5 15v-4" />
  </Svg>
);

/** Repère de carte (implantations). */
export const PictoRepere: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M12 21.5s-7-6.1-7-11.6a7 7 0 0 1 14 0c0 5.5-7 11.6-7 11.6z" />
    <circle cx="12" cy="9.9" r="2.6" />
  </Svg>
);

/** Flèche (bouton final, comme Promptly). */
export const PictoFleche: React.FC<PictoProps> = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
