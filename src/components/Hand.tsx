import type { Card } from '../engine/cards';
import { handValue, isBlackjack } from '../engine/hand';
import { PlayingCard, type CardSize } from './PlayingCard';

export function handLabel(cards: Card[]): string {
  if (cards.length === 0) return '';
  if (isBlackjack(cards)) return 'Blackjack';
  const v = handValue(cards);
  if (v.total > 21) return `${v.total} — sauté`;
  if (v.soft && v.total !== 21) return `${v.total - 10} / ${v.total}`;
  return String(v.total);
}

export function Hand({
  cards,
  hideSecond = false,
  size = 'md',
  label,
  showTotal = true,
  overlap = true,
}: {
  cards: Card[];
  hideSecond?: boolean;
  size?: CardSize;
  label?: string;
  showTotal?: boolean;
  overlap?: boolean;
}) {
  const shown = hideSecond ? cards.slice(0, 1) : cards;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex ${overlap ? '-space-x-6 sm:-space-x-8' : 'gap-2'}`}>
        {cards.map((c, i) => (
          <PlayingCard key={i} card={c} faceDown={hideSecond && i === 1} size={size} />
        ))}
      </div>
      {(label || showTotal) && (
        <div className="text-center text-xs text-slate-200 sm:text-sm">
          {label && <span className="mr-1 font-medium">{label}</span>}
          {showTotal && shown.length > 0 && <span className="rounded bg-black/40 px-1.5 py-0.5 tabular-nums">{handLabel(shown)}</span>}
        </div>
      )}
    </div>
  );
}
