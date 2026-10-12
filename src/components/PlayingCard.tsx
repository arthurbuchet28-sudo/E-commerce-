import type { Card } from '../engine/cards';
import { isRed } from '../engine/cards';

const SIZES = {
  xs: 'w-8 h-11 text-[10px] rounded',
  sm: 'w-11 h-16 text-xs rounded-md',
  md: 'w-14 h-20 text-sm rounded-lg sm:w-16 sm:h-24 sm:text-base',
  lg: 'w-20 h-28 text-lg rounded-xl sm:w-24 sm:h-36 sm:text-2xl',
  xl: 'w-28 h-40 text-2xl rounded-xl sm:w-36 sm:h-52 sm:text-4xl',
};

export type CardSize = keyof typeof SIZES;

export function PlayingCard({ card, faceDown = false, size = 'md', className = '' }: { card?: Card; faceDown?: boolean; size?: CardSize; className?: string }) {
  if (faceDown || !card) {
    return (
      <div
        aria-label="Carte face cachée"
        className={`${SIZES[size]} deal-in shrink-0 border-2 border-white/80 bg-[repeating-linear-gradient(45deg,#7f1d1d_0_6px,#991b1b_6px_12px)] shadow-md ${className}`}
      />
    );
  }
  const red = isRed(card);
  const label = card.rank === '10' ? '10' : card.rank;
  return (
    <div
      aria-label={`${label}${card.suit}`}
      className={`${SIZES[size]} deal-in relative flex shrink-0 flex-col justify-between border border-slate-300 bg-white p-1 font-semibold shadow-md select-none ${red ? 'text-red-600' : 'text-slate-900'} ${className}`}
    >
      <div className="leading-none">
        <div>{label}</div>
        <div>{card.suit}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-[1.8em] opacity-90">{card.suit}</div>
      <div className="rotate-180 self-end leading-none">
        <div>{label}</div>
        <div>{card.suit}</div>
      </div>
    </div>
  );
}

export function parseCard(s: string): Card {
  const suit = s.slice(-1) as Card['suit'];
  const rank = s.slice(0, -1) as Card['rank'];
  return { rank, suit };
}
