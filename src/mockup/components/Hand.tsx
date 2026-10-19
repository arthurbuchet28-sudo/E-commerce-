import React, { useId } from "react";
import { mix } from "../../lib/utils";
import { A } from "../../site/theme";
import { MOCKUP } from "../config";

/** Point de contact (bout de l'index) dans le repère SVG de la main. */
export const FINGERTIP = { x: 300, y: 64 };
export const HAND_VIEWBOX = { w: 600, h: 900 };

/**
 * Main droite vue de dessus, index tendu, autres doigts repliés, pouce sur le côté.
 * - press : 0 → 1, l'index appuie (dernière phalange écrasée / pliée)
 * - rim : intensité du liseré de lumière venant de l'écran (0 → 1)
 */
export const Hand: React.FC<{ press: number; rim: number; width: number }> = ({ press, rim, width }) => {
  const id = "hand" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const skin = MOCKUP.skin;
  const c = {
    light: mix(skin, "#ffffff", 0.22),
    lighter: mix(skin, "#ffffff", 0.38),
    base: skin,
    dark: mix(skin, "#000000", 0.28),
    darker: mix(skin, "#000000", 0.45),
    red: mix(skin, "#7a2e22", 0.4),
    nail: mix(mix(skin, "#ffffff", 0.45), "#f2a9a0", 0.3),
  };

  // Formes (repère 600 × 900, poignet en bas)
  const dorsum =
    "M256 405 C238 520 268 650 298 772 L528 778 C560 684 602 592 590 522 C582 470 546 440 502 420 C458 401 402 389 346 392 C300 395 272 398 256 405 Z";
  // Index d'un seul tenant (pas de couture visible) ; les articulations sont rendues par les plis
  const index = "M267 102 C267 50 333 50 333 102 C334 160 336 220 339 282 C341 340 344 392 346 432 C346 456 254 456 254 432 C256 392 259 340 261 282 C264 220 266 160 267 102 Z";
  const thumb = "M300 706 C262 690 214 600 190 520 C178 478 196 452 222 456 C248 460 262 500 276 548 C292 600 320 660 330 700 Z";
  // Doigts repliés (du plus éloigné au plus proche de l'index) : ils se chevauchent
  const folded = [
    { d: "M488 404 C488 380 564 382 566 406 C570 440 572 476 570 506 C566 524 494 524 490 506 C486 476 486 440 488 404 Z", t: 2 },
    { d: "M414 360 C414 332 502 332 504 360 C508 396 510 440 508 478 C504 498 418 498 414 478 C410 440 410 396 414 360 Z", t: 1 },
    { d: "M336 330 C336 298 432 298 434 330 C438 370 440 418 438 456 C434 478 340 478 336 456 C332 418 332 370 336 330 Z", t: 0 },
  ];
  const sleeve = "M262 738 C300 724 524 724 566 742 L612 900 L222 900 Z";

  const distalSquash = 1 - 0.03 * press - 0.05 * press; // écrasement + légère flexion vue de dessus

  return (
    <svg width={width} height={(width * HAND_VIEWBOX.h) / HAND_VIEWBOX.w} viewBox={`0 0 ${HAND_VIEWBOX.w} ${HAND_VIEWBOX.h}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`${id}fing`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c.dark} />
          <stop offset="35%" stopColor={c.light} />
          <stop offset="60%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.darker} />
        </linearGradient>
        <radialGradient id={`${id}back`} cx="0.55" cy="0.25" r="0.75">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="55%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
        <linearGradient id={`${id}fold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.red} />
          <stop offset="30%" stopColor={c.dark} />
          <stop offset="70%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.base} />
        </linearGradient>
        <linearGradient id={`${id}thumb`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor={c.darker} />
          <stop offset="55%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={`${id}sleeve`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MOCKUP.sleeve[0]} />
          <stop offset="100%" stopColor={MOCKUP.sleeve[1]} />
        </linearGradient>
        {/* liseré de l'écran : vient du haut-gauche (côté écran) */}
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0.8" y2="0.7">
          <stop offset="0%" stopColor={A.light} stopOpacity={0.4 * rim} />
          <stop offset="45%" stopColor={A.light} stopOpacity={0.22 * rim} />
          <stop offset="75%" stopColor={A.light} stopOpacity={0} />
        </linearGradient>
        <filter id={`${id}soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
        <filter id={`${id}noise`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <clipPath id={`${id}clip`}>
          <path d={dorsum} />
          <path d={index} />
          <path d={thumb} />
          {folded.map((f) => (
            <path key={f.t} d={f.d} />
          ))}
        </clipPath>
      </defs>

      {/* Pouce (en retrait, sous le dos de la main) */}
      <path d={thumb} fill={`url(#${id}thumb)`} />
      <path d="M200 492 C204 470 228 466 238 484 C232 500 210 506 200 492 Z" fill={c.nail} opacity={0.85} />
      {/* Doigts repliés : chacun un peu plus sombre (occlusion) */}
      {folded.map((f) => (
        <g key={f.t}>
          <path d={f.d} fill={`url(#${id}fold)`} />
          <path d={f.d} fill="#000" opacity={0.04 + f.t * 0.05} />
          {/* ombre portée sur le doigt voisin (occlusion) */}
          <path d={f.d} fill="none" stroke={c.red} strokeWidth={10} opacity={0.35} filter={`url(#${id}soft)`} transform="translate(-4 2)" />
        </g>
      ))}
      {/* Dos de la main */}
      <path d={dorsum} fill={`url(#${id}back)`} />
      {/* creux entre les métacarpiens et ombre au pied de l'index */}
      <path d="M346 420 C360 520 372 620 380 720" stroke={c.dark} strokeWidth={10} opacity={0.22} fill="none" filter={`url(#${id}soft)`} />
      <path d="M430 410 C440 520 446 620 448 730" stroke={c.dark} strokeWidth={10} opacity={0.18} fill="none" filter={`url(#${id}soft)`} />
      <path d="M342 400 C330 380 330 300 340 270" stroke={c.red} strokeWidth={12} opacity={0.35} fill="none" filter={`url(#${id}soft)`} />
      {/* jointures : reflets doux */}
      {[
        [300, 424, 30],
        [386, 446, 26],
        [462, 466, 22],
        [530, 500, 18],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill={c.lighter} opacity={0.22} filter={`url(#${id}soft)`} />
      ))}
      {/* ombre propre côté opposé à la lumière */}
      <path d={dorsum} fill="none" stroke={c.darker} strokeWidth={40} opacity={0.35} filter={`url(#${id}soft)`} clipPath={`url(#${id}clip)`} transform="translate(26 0)" />

      {/* Index : ombre douce sur les doigts repliés, puis le doigt */}
      <path d={index} fill="none" stroke="#000" strokeWidth={14} opacity={0.28} filter={`url(#${id}soft)`} transform="translate(8 6)" />
      <path d={index} fill={`url(#${id}fing)`} />
      {/* dernière phalange articulée : s'écrase et se plie au clic */}
      <g transform={`translate(300 182) scale(1 ${distalSquash}) translate(-300 -182)`}>
        <path d="M267 102 C267 50 333 50 333 102 L334 180 L266 180 Z" fill={`url(#${id}fing)`} />
        {/* ongle */}
        <path d="M278 132 C277 84 323 84 322 132 C321 146 279 146 278 132 Z" fill={c.nail} />
        <path d="M286 104 C290 92 304 90 312 96" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none" />
        <path d="M280 138 C292 146 308 146 320 138" stroke={c.dark} strokeWidth={2} opacity={0.35} fill="none" />
      </g>
      {/* plis des articulations */}
      {[186, 292].map((y) => (
        <g key={y} opacity={0.32}>
          <path d={`M276 ${y} C290 ${y + 6} 310 ${y + 6} 324 ${y}`} stroke={c.darker} strokeWidth={2.5} fill="none" />
          <path d={`M282 ${y + 9} C294 ${y + 13} 306 ${y + 13} 318 ${y + 9}`} stroke={c.darker} strokeWidth={1.8} fill="none" />
        </g>
      ))}
      {/* reflet sur le dessus de l'index */}
      <path d="M292 120 L290 420" stroke={c.lighter} strokeWidth={14} opacity={0.22} strokeLinecap="round" filter={`url(#${id}soft)`} />

      {/* Texture de peau très légère */}
      <g clipPath={`url(#${id}clip)`} opacity={0.05} style={{ mixBlendMode: "multiply" }}>
        <rect width={600} height={900} filter={`url(#${id}noise)`} />
      </g>

      {/* Liseré de lumière de l'écran */}
      {rim > 0.01 ? (
        <g clipPath={`url(#${id}clip)`}>
          <g fill="none" stroke={`url(#${id}rim)`} strokeWidth={18} filter={`url(#${id}soft)`} style={{ mixBlendMode: "screen" }}>
            <path d={index} transform="translate(-3 -2)" />
            <path d={thumb} transform="translate(-3 -2)" />
          </g>
        </g>
      ) : null}

      {/* Manche de pull */}
      <path d={sleeve} fill={`url(#${id}sleeve)`} />
      <path d="M262 738 C300 724 524 724 566 742 L572 760 C528 744 300 744 258 758 Z" fill="#000" opacity={0.25} />
      {Array.from({ length: 16 }).map((_, i) => {
        const x = 270 + i * 19;
        return <line key={i} x1={x} y1={742} x2={x + 2 + i * 0.6} y2={812} stroke="#fff" strokeWidth={2} opacity={0.08} />;
      })}
      <path d="M248 812 C320 802 520 802 590 816" stroke="#000" strokeWidth={3} opacity={0.4} fill="none" />
    </svg>
  );
};
