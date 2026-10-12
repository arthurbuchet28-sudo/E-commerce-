/**
 * Bac de défausse vu de côté : la hauteur de la pile de cartes est proportionnelle
 * au nombre de jeux défaussés. Des graduations optionnelles marquent chaque jeu.
 */
export function DiscardTray({ decks, capacity = 8, showScale = false, label }: { decks: number; capacity?: number; showScale?: boolean; label?: string }) {
  const W = 120;
  const H = 260;
  const inner = H - 20;
  const perDeck = inner / capacity;
  const h = Math.max(0, Math.min(capacity, decks)) * perDeck;
  const lines = Math.round(decks * 52 / 4); // une ligne toutes les ~4 cartes
  return (
    <svg viewBox={`0 0 ${W + (showScale ? 40 : 0)} ${H}`} className="h-64 w-auto" role="img" aria-label={label ?? 'Bac de défausse'}>
      {/* bac */}
      <rect x="10" y="4" width={W - 20} height={H - 8} rx="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" opacity="0.9" />
      {/* pile */}
      {h > 0 && (
        <g>
          <rect x="16" y={H - 10 - h} width={W - 32} height={h} fill="#f8fafc" rx="2" />
          {Array.from({ length: lines }, (_, i) => {
            const y = H - 10 - (i + 0.5) * (h / Math.max(1, lines));
            return <line key={i} x1="16" x2={W - 16} y1={y} y2={y} stroke="#cbd5e1" strokeWidth="0.6" />;
          })}
          <rect x="16" y={H - 10 - h} width="5" height={h} fill="#991b1b" opacity="0.7" />
        </g>
      )}
      {showScale &&
        Array.from({ length: capacity + 1 }, (_, i) => {
          const y = H - 10 - i * perDeck;
          return (
            <g key={i}>
              <line x1={W - 8} x2={W + 4} y1={y} y2={y} stroke="#fbbf24" strokeWidth="1.5" />
              <text x={W + 8} y={y + 4} fontSize="11" fill="#fbbf24">
                {i}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
