import { useState } from 'react';

export interface Bar {
  label: string;
  value: number;
}

/**
 * Diagramme en barres verticales (SVG), une seule série.
 * Valeurs négatives possibles (barres sous la ligne de base, autre teinte).
 * Survol / focus : info-bulle avec la valeur exacte ; les extrêmes sont étiquetés directement.
 */
export function BarChart({
  bars,
  format,
  height = 200,
  positiveColor = '#10b981',
  negativeColor = '#f43f5e',
  ariaLabel,
}: {
  bars: Bar[];
  format: (v: number) => string;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  ariaLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const padL = 8;
  const padR = 8;
  const padT = 24;
  const padB = 28;
  const max = Math.max(0, ...bars.map((b) => b.value));
  const min = Math.min(0, ...bars.map((b) => b.value));
  const span = max - min || 1;
  const plotH = height - padT - padB;
  const y = (v: number) => padT + ((max - v) / span) * plotH;
  const slot = (W - padL - padR) / bars.length;
  const bw = Math.min(40, slot * 0.6);
  const iMax = bars.findIndex((b) => b.value === max);
  const iMin = bars.findIndex((b) => b.value === min);

  return (
    <figure className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={ariaLabel}>
        {/* ligne de base */}
        <line x1={padL} x2={W - padR} y1={y(0)} y2={y(0)} stroke="#475569" strokeWidth="1" />
        {bars.map((b, i) => {
          const cx = padL + slot * i + slot / 2;
          const top = Math.min(y(b.value), y(0));
          const h = Math.max(1, Math.abs(y(b.value) - y(0)));
          const color = b.value >= 0 ? positiveColor : negativeColor;
          const active = hover === i;
          const showLabel = active || i === iMax || (min < 0 && i === iMin);
          return (
            <g
              key={b.label}
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              style={{ outline: 'none' }}
            >
              <rect x={cx - slot / 2} y={padT - 10} width={slot} height={plotH + 20} fill={active ? '#1e293b' : 'transparent'} />
              <rect x={cx - bw / 2} y={top} width={bw} height={h} rx="4" fill={color} opacity={hover === null || active ? 1 : 0.55} />
              {showLabel && (
                <text x={cx} y={b.value >= 0 ? top - 6 : top + h + 14} textAnchor="middle" fontSize="13" fill="#e2e8f0" fontWeight={600}>
                  {format(b.value)}
                </text>
              )}
              <text x={cx} y={height - 8} textAnchor="middle" fontSize="13" fill="#94a3b8">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
