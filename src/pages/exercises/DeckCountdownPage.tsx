import { useCallback, useEffect, useState } from 'react';
import { ExerciseShell } from '../../components/ExerciseShell';
import { PlayingCard } from '../../components/PlayingCard';
import { Button, Feedback, Panel, Stat, formatSigned } from '../../components/ui';
import { TimerDisplay, formatSeconds, useStopwatch } from '../../components/Timer';
import { useProgress } from '../../lib/progress';
import { type Card, createShuffledDeck } from '../../engine/cards';
import { type CountClass, countClass, runningCount } from '../../engine/count';

const TARGET_MS = 25000;
type Phase = 'idle' | 'running' | 'answer' | 'result';

export function DeckCountdownPage() {
  const { progress, recordExercise } = useProgress();
  const sw = useStopwatch();
  const [phase, setPhase] = useState<Phase>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [missing, setMissing] = useState<Card | null>(null);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [answerClass, setAnswerClass] = useState<CountClass | null>(null);
  const rec = progress.exercises['deck-countdown'];

  const start = () => {
    const deck = createShuffledDeck();
    const m = deck.pop()!;
    setCards(deck);
    setMissing(m);
    setIndex(0);
    setAnswerClass(null);
    setPhase('running');
    sw.begin();
  };

  const advance = useCallback(() => {
    if (phase !== 'running') return;
    if (index + 1 >= cards.length) {
      setTime(sw.stop());
      setPhase('answer');
    } else setIndex((i) => i + 1);
  }, [phase, index, cards.length, sw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        if (phase === 'running') {
          e.preventDefault();
          advance();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, phase]);

  const submit = (c: CountClass) => {
    setAnswerClass(c);
    const ok = c === countClass(missing!);
    recordExercise('deck-countdown', { answered: 1, correct: ok ? 1 : 0, score: ok ? Math.round(time / 100) / 10 : undefined, lowerIsBetter: true });
    setPhase('result');
  };

  const rc = runningCount(cards);
  const ok = missing && answerClass === countClass(missing);

  return (
    <ExerciseShell id="deck-countdown" intro="Une carte a été retirée au hasard. Faites défiler les 51 autres le plus vite possible (bouton, barre d'espace ou flèche droite) en tenant le compte. Un jeu complet valant 0, le compte final révèle la catégorie de la carte manquante.">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Record (sans erreur)" value={rec?.best !== undefined ? formatSeconds(rec.best * 1000) : '—'} />
        <Stat label="Objectif" value="25,0 s" />
        <Stat label="Tentatives" value={rec?.attempts ?? 0} hint={rec ? `${rec.correct} réussie(s)` : undefined} />
      </div>
      <div className="felt flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl p-6">
        {phase === 'idle' && <Button variant="gold" onClick={start}>Démarrer le chronomètre</Button>}
        {phase === 'running' && (
          <>
            <TimerDisplay ms={sw.elapsed} target={TARGET_MS} />
            <button onClick={advance} className="rounded-xl focus-visible:outline-2 focus-visible:outline-amber-400" aria-label="Carte suivante">
              <PlayingCard key={index} card={cards[index]} size="xl" />
            </button>
            <div className="text-xs text-emerald-200 tabular-nums">{index + 1} / 51 — touchez la carte ou appuyez sur Espace</div>
          </>
        )}
        {phase === 'answer' && (
          <div className="space-y-3 text-center">
            <TimerDisplay ms={time} target={TARGET_MS} />
            <div className="text-slate-100">Quelle catégorie de carte manque ?</div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => submit('basse')}>Basse (2-6)</Button>
              <Button variant="secondary" onClick={() => submit('neutre')}>Neutre (7-9)</Button>
              <Button variant="danger" onClick={() => submit('haute')}>Haute (10-As)</Button>
            </div>
          </div>
        )}
        {phase === 'result' && missing && (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-center gap-4">
              <PlayingCard card={missing} size="lg" />
              <div className="text-slate-100">
                <div>Carte manquante : <strong>{countClass(missing)}</strong></div>
                <div>Compte des 51 cartes : <strong>{formatSigned(rc)}</strong></div>
                <div>Temps : <strong>{formatSeconds(time)}</strong></div>
              </div>
            </div>
            <Feedback ok={!!ok}>
              {ok
                ? time <= TARGET_MS
                  ? '✓ Bonne réponse et sous les 25 secondes : objectif atteint !'
                  : '✓ Bonne réponse. Il reste à gagner en vitesse pour passer sous 25 secondes.'
                : `✗ Mauvaise catégorie. Rappel : compte final +1 → une haute manque ; 0 → une neutre ; −1 → une basse.`}
            </Feedback>
            <Button onClick={start}>Nouveau jeu</Button>
          </div>
        )}
      </div>
      {rec && rec.history.length > 0 && (
        <Panel title="Derniers temps réussis">
          <div className="flex flex-wrap gap-2 text-sm tabular-nums">
            {rec.history.slice(-15).map((h, i) => (
              <span key={i} className={`rounded px-2 py-1 ${h.score <= 25 ? 'bg-emerald-900/60 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
                {String(h.score).replace('.', ',')} s
              </span>
            ))}
          </div>
        </Panel>
      )}
    </ExerciseShell>
  );
}
