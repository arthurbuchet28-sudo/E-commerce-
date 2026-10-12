import type { BlackjackGame, PlayerHand, Seat } from '../engine/game';
import { Hand } from './Hand';

const RESULT_LABEL: Record<NonNullable<PlayerHand['result']>, { t: string; c: string }> = {
  blackjack: { t: 'Blackjack !', c: 'bg-amber-400 text-slate-900' },
  win: { t: 'Gagné', c: 'bg-emerald-500 text-white' },
  push: { t: 'Égalité', c: 'bg-slate-400 text-slate-900' },
  lose: { t: 'Perdu', c: 'bg-rose-600 text-white' },
  bust: { t: 'Sauté', c: 'bg-rose-700 text-white' },
  surrender: { t: 'Abandon', c: 'bg-slate-600 text-white' },
};

function SeatView({ seat, game }: { seat: Seat; game: BlackjackGame }) {
  const active = game.phase === 'playing' && game.currentSeat?.id === seat.id;
  return (
    <div className={`flex min-w-[6.5rem] flex-col items-center gap-1 rounded-xl px-1.5 py-2 ${seat.isHuman ? 'bg-black/25 ring-1 ring-amber-400/60' : ''} ${active ? 'ring-2 ring-emerald-300' : ''}`}>
      <div className={`text-xs font-semibold ${seat.isHuman ? 'text-amber-300' : 'text-emerald-100'}`}>{seat.name}</div>
      <div className="flex flex-wrap justify-center gap-2">
        {seat.hands.map((h, i) => {
          const isActiveHand = active && seat.activeHand === i;
          return (
            <div key={i} className={`flex flex-col items-center gap-1 rounded-lg p-1 ${isActiveHand && seat.hands.length > 1 ? 'bg-emerald-400/20' : ''}`}>
              <Hand cards={h.cards} size={seat.isHuman ? 'md' : 'sm'} />
              <div className="flex items-center gap-1 text-[11px] text-emerald-100">
                <span className="rounded-full bg-amber-500/90 px-1.5 font-semibold text-slate-900 tabular-nums">{h.bet} u</span>
                {h.doubled && <span>×2</span>}
                {h.result && <span className={`rounded px-1.5 ${RESULT_LABEL[h.result].c}`}>{RESULT_LABEL[h.result].t}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {seat.insurance > 0 && <div className="text-[11px] text-sky-200">Assurance {seat.insurance} u</div>}
    </div>
  );
}

/** Table de jeu : croupier en haut, sièges des joueurs en bas (l'ordre de jeu va de gauche à droite). */
export function TableView({ game }: { game: BlackjackGame }) {
  return (
    <div className="felt rounded-[2rem] border-4 border-amber-900/70 p-3 shadow-inner sm:p-5">
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">Croupier</div>
        {game.dealerCards.length > 0 ? (
          <Hand cards={game.dealerCards} hideSecond={!game.holeRevealed} size="md" />
        ) : (
          <div className="h-20 text-sm text-emerald-200/60 sm:h-24">Placez votre mise</div>
        )}
        <div className="mt-1 text-[10px] text-emerald-200/70 sm:text-xs">
          {game.rules.blackjackPayout === 1.5 ? 'BLACKJACK PAYÉ 3:2' : 'BLACKJACK PAYÉ 6:5'} · {game.rules.dealerHitsSoft17 ? 'LE CROUPIER TIRE SUR SOFT 17' : 'LE CROUPIER RESTE SUR TOUS LES 17'}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-2">
        {game.seats.map((s) => (
          <SeatView key={s.id} seat={s} game={game} />
        ))}
      </div>
    </div>
  );
}
