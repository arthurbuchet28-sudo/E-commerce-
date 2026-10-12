import { useEffect, useRef, useState } from 'react';
import { ExerciseShell, SessionBar } from '../../components/ExerciseShell';
import { PlayingCard } from '../../components/PlayingCard';
import { Button, Feedback, Panel, formatSigned } from '../../components/ui';
import { useSession } from '../../lib/useSession';
import { useProgress } from '../../lib/progress';
import { type Card, createShuffledDeck } from '../../engine/cards';
import { hiLoValue, runningCount } from '../../engine/count';
import { CountInput } from './CountInput';

export const STREAM_LEVELS = [
  { level: 1, ms: 1200, cards: 10 },
  { level: 2, ms: 1000, cards: 15 },
  { level: 3, ms: 800, cards: 20 },
  { level: 4, ms: 650, cards: 25 },
  { level: 5, ms: 500, cards: 30 },
  { level: 6, ms: 400, cards: 36 },
  { level: 7, ms: 320, cards: 44 },
  { level: 8, ms: 250, cards: 52 },
];

type Phase = 'idle' | 'countdown' | 'running' | 'answer' | 'result';

export function CardStreamPage() {
  const { progress, setStreamLevel } = useProgress();
  const { stats, answer } = useSession('card-stream');
  const [level, setLevel] = useState(Math.min(progress.streamLevel, 8));
  const [custom, setCustom] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [guess, setGuess] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const conf = STREAM_LEVELS[level - 1];
  const ms = custom ?? conf.ms;

  const start = () => {
    const deck = createShuffledDeck().slice(0, conf.cards);
    setCards(deck);
    setIndex(0);
    setGuess(null);
    setCountdown(3);
    setPhase('countdown');
  };

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown <= 0) {
        setPhase('running');
        return;
      }
      timer.current = window.setTimeout(() => setCountdown((c) => c - 1), 600);
    } else if (phase === 'running') {
      timer.current = window.setTimeout(() => {
        if (index + 1 >= cards.length) setPhase('answer');
        else setIndex((i) => i + 1);
      }, ms);
    }
    return () => window.clearTimeout(timer.current);
  }, [phase, countdown, index, cards.length, ms]);

  const rc = runningCount(cards);

  const submit = (v: number) => {
    setGuess(v);
    const ok = v === rc;
    answer(ok);
    if (ok && custom === null) setStreamLevel(Math.min(8, level + 1));
    setPhase('result');
  };

  return (
    <ExerciseShell id="card-stream" intro="Les cartes apparaissent une à une. Tenez le running count Hi-Lo de tête, puis saisissez-le. Réussir un niveau débloque le suivant.">
      <Panel>
        <div className="mb-3 text-sm text-slate-300">Niveau (débloqué jusqu'au {Math.min(progress.streamLevel, 8)})</div>
        <div className="flex flex-wrap gap-1.5">
          {STREAM_LEVELS.map((l) => (
            <button
              key={l.level}
              disabled={l.level > progress.streamLevel || phase === 'running' || phase === 'countdown'}
              onClick={() => {
                setLevel(l.level);
                setCustom(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm disabled:opacity-30 ${level === l.level && custom === null ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {l.level}
              <span className="block text-[10px] opacity-80">{(1000 / l.ms).toFixed(1).replace('.', ',')} c/s · {l.cards}</span>
            </button>
          ))}
        </div>
        <label className="mt-3 block text-sm text-slate-400">
          Vitesse libre (entraînement, ne valide pas de niveau) : {custom ? `${custom} ms par carte` : 'désactivée'}
          <input type="range" min={150} max={2000} step={50} value={custom ?? ms} onChange={(e) => setCustom(Number(e.target.value))} className="block w-full max-w-sm accent-emerald-500" disabled={phase === 'running'} />
        </label>
      </Panel>

      <div className="felt flex min-h-64 flex-col items-center justify-center rounded-2xl p-6">
        {phase === 'idle' && <Button variant="gold" onClick={start}>Démarrer ({conf.cards} cartes, {(ms / 1000).toFixed(2).replace('.', ',')} s/carte)</Button>}
        {phase === 'countdown' && <div className="text-6xl font-bold text-white">{countdown > 0 ? countdown : 'Go'}</div>}
        {phase === 'running' && (
          <div className="flex flex-col items-center gap-2">
            <PlayingCard key={index} card={cards[index]} size="xl" />
            <div className="text-xs text-emerald-200 tabular-nums">{index + 1} / {cards.length}</div>
          </div>
        )}
        {phase === 'answer' && <CountInput onSubmit={submit} />}
        {phase === 'result' && guess !== null && (
          <div className="w-full space-y-3">
            <Feedback ok={guess === rc}>
              {guess === rc ? `✓ Exact : ${formatSigned(rc)}. ${custom === null && level < 8 ? 'Niveau suivant débloqué !' : ''}` : `✗ Vous avez répondu ${formatSigned(guess)}, le running count était ${formatSigned(rc)}.`}
            </Feedback>
            <div className="flex flex-wrap gap-2">
              <Button onClick={start}>Recommencer ce niveau</Button>
              {guess === rc && custom === null && level < 8 && <Button variant="gold" onClick={() => { setLevel(level + 1); setPhase('idle'); }}>Niveau {level + 1} →</Button>}
            </div>
          </div>
        )}
      </div>

      {phase === 'result' && (
        <Panel title="Correction carte par carte">
          <div className="flex flex-wrap gap-2">
            {cards.map((c, i) => {
              const sub = runningCount(cards.slice(0, i + 1));
              const v = hiLoValue(c);
              return (
                <div key={i} className="flex flex-col items-center">
                  <PlayingCard card={c} size="xs" />
                  <span className={`text-[10px] ${v > 0 ? 'text-emerald-300' : v < 0 ? 'text-rose-300' : 'text-slate-500'}`}>{v > 0 ? '+1' : v < 0 ? '−1' : '0'}</span>
                  <span className="text-xs font-semibold tabular-nums text-slate-200">{formatSigned(sub)}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
      <SessionBar stats={stats} />
    </ExerciseShell>
  );
}
