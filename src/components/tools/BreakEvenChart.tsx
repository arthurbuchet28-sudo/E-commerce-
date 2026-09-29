"use client";

import { useId, useState } from "react";

import { formatEuro } from "@/lib/calc/format";

type Point = { sales: number; margin: number };

const W = 560;
const H = 300;
const PAD = { top: 16, right: 16, bottom: 44, left: 64 };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * Cumulative margin (one series, sage) against monthly fixed costs (reference line, dashed
 * neutral). Hover or keyboard focus shows the value; a data table is available below.
 */
export function BreakEvenChart({
  series,
  fixedCosts,
  salesNeeded,
}: {
  series: Point[];
  fixedCosts: number;
  salesNeeded: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const maxX = series.at(-1)?.sales ?? 1;
  const maxY = niceMax(Math.max(series.at(-1)?.margin ?? 0, fixedCosts));
  const x = (v: number) => PAD.left + (v / maxX) * (W - PAD.left - PAD.right);
  const y = (v: number) => H - PAD.bottom - (v / maxY) * (H - PAD.top - PAD.bottom);
  const ticksY = [0, maxY / 2, maxY];
  const path = series.map((p, i) => `${i ? "L" : "M"}${x(p.sales)},${y(p.margin)}`).join(" ");
  const point = active === null ? null : series[active];

  function onMove(clientX: number, rect: DOMRect) {
    const vx = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    series.forEach((p, i) => {
      if (Math.abs(x(p.sales) - vx) < Math.abs(x(series[best].sales) - vx)) best = i;
    });
    setActive(best);
  }

  return (
    <figure className="flex flex-col gap-3">
      <figcaption id={titleId} className="font-semibold">
        Marge cumulée selon le nombre de ventes du mois
      </figcaption>
      <ul className="flex flex-wrap gap-4 text-small" aria-label="Légende">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-6 bg-sage" /> Marge cumulée
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="w-6 border-t-2 border-dashed border-muted" /> Charges fixes
          du mois
        </li>
      </ul>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none select-none"
          role="img"
          aria-labelledby={titleId}
          onPointerMove={(e) => onMove(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setActive(null)}
        >
          {ticksY.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={12}
                fill="var(--muted)"
              >
                {formatEuro(t, true)}
              </text>
            </g>
          ))}
          <text x={PAD.left} y={H - 12} fontSize={12} fill="var(--muted)">
            0
          </text>
          <text x={W - PAD.right} y={H - 12} textAnchor="end" fontSize={12} fill="var(--muted)">
            {maxX} ventes
          </text>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(fixedCosts)}
            y2={y(fixedCosts)}
            stroke="var(--muted)"
            strokeWidth={2}
            strokeDasharray="6 5"
          />
          <text
            x={W - PAD.right}
            y={y(fixedCosts) - 8}
            textAnchor="end"
            fontSize={12}
            fill="var(--text)"
          >
            Charges fixes : {formatEuro(fixedCosts, true)}
          </text>
          <path
            d={path}
            fill="none"
            stroke="var(--sage)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {salesNeeded <= maxX && (
            <g>
              <line
                x1={x(salesNeeded)}
                x2={x(salesNeeded)}
                y1={y(0)}
                y2={y(fixedCosts)}
                stroke="var(--sage)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={x(salesNeeded)}
                cy={y(fixedCosts)}
                r={5}
                fill="var(--sage)"
                stroke="var(--sheet)"
                strokeWidth={2}
              />
              <text
                x={x(salesNeeded)}
                y={H - 28}
                textAnchor="middle"
                fontSize={12}
                fill="var(--text)"
                fontWeight={600}
              >
                {salesNeeded} ventes
              </text>
            </g>
          )}
          {point && (
            <g>
              <line
                x1={x(point.sales)}
                x2={x(point.sales)}
                y1={PAD.top}
                y2={y(0)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <circle
                cx={x(point.sales)}
                cy={y(point.margin)}
                r={5}
                fill="var(--sage)"
                stroke="var(--sheet)"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
        {point && (
          <div
            className="pointer-events-none absolute top-2 rounded-ui border border-line bg-sheet px-3 py-2 text-small tabular-nums"
            style={{ left: `${Math.min(70, (x(point.sales) / W) * 100)}%` }}
          >
            <p className="font-semibold">{point.sales} ventes</p>
            <p>Marge cumulée : {formatEuro(point.margin, true)}</p>
          </div>
        )}
      </div>
      <details className="rounded-ui border border-line bg-sheet">
        <summary className="min-h-11 cursor-pointer px-4 py-3 font-semibold">
          Voir les données en tableau
        </summary>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left text-small tabular-nums">
            <caption className="sr-only">Marge cumulée selon le nombre de ventes</caption>
            <thead>
              <tr>
                <th scope="col" className="py-1">
                  Ventes
                </th>
                <th scope="col" className="py-1 text-right">
                  Marge cumulée
                </th>
                <th scope="col" className="py-1 text-right">
                  Charges fixes couvertes
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.sales} className="border-t border-line">
                  <th scope="row" className="py-1 font-normal">
                    {p.sales}
                  </th>
                  <td className="py-1 text-right">{formatEuro(p.margin, true)}</td>
                  <td className="py-1 text-right">{p.margin >= fixedCosts ? "Oui" : "Non"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
