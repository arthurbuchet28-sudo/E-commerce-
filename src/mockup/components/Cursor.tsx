import React from "react";

/** Curseur flèche façon macOS, en SVG. */
export const Cursor: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({ x, y, scale = 1, opacity = 1 }) => (
  <svg
    width={30}
    height={44}
    viewBox="0 0 30 44"
    style={{
      position: "absolute",
      left: x - 3,
      top: y - 2,
      transform: `scale(${scale})`,
      transformOrigin: "3px 2px",
      opacity,
      filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.45))",
      zIndex: 20,
    }}
  >
    <path d="M3 2 L3 33 L10.5 26 L15.5 38.5 L20.5 36.5 L15.5 24.5 L25.5 24.5 Z" fill="#000" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
  </svg>
);
