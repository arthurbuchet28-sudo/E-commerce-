import { useCallback, useEffect, useState } from 'react';
import { ExerciseShell, SessionBar } from '../../components/ExerciseShell';
import { DiscardTray } from '../../components/DiscardTray';
import { Button, Feedback, Segmented, Toggle, formatSigned } from '../../components/ui';
import { useSession } from '../../lib/useSession';
import { trueCount } from '../../engine/count';
import { randInt } from '../../engine/rng';
import { CountInput } from './CountInput';

type Display = 'chiffres' | 'visuel';

interface Problem {
  decks: number;
  discarded: number;
  rc: number;
  start: number;
}

function makeProblem(decks: number): Problem {
  const discarded = randInt(1, decks * 2 - 2) / 2; // 0,5 à decks − 1
  const remaining = decks - discarded;
  const tc = randInt(-4, 8);
  // Running count cohérent avec un TC visé, plus un peu de bruit pour obtenir des divisions non entières.
  const rc = Math.round(tc * remaining + (Math.random() - 0.5) * remaining);
  return { decks, discarded, rc, start: performance.now() };
}

export function TrueCountPage() {
  const { stats, answer, flush } = useSession('true-count');
  const [decks, setDecks] = useState(6);
  const [display, setDisplay] = useState<Display>('chiffres');
  const [scale, setScale] = useState(true);
  const [p, setP] = useState<Problem>(() => makeProblem(6));
  const [result, setResult] = useState<{ guess: number; ms: number } | null>(null);

  const next = useCallback(() => {
    setP(makeProblem(decks));
    setResult(null);
  }, [decks]);

  useEffect(() => {
    next();
  }, [next]);

  const remaining = p.decks - p.discarded;
  const expected = trueCount(p.rc, remaining, 'floor');
  const fmt = (n: number) => n.toString().replace('.', ',');

  const submit = (v: number) => {
    const ms = performance.now() - p.start;
    setResult({ guess: v, ms });
    answer(v === expected, ms);
  };

  return (
    <ExerciseShell id="true-count" intro="Calculez le true count = running count ÷ jeux restants, arrondi à l'entier inférieur (ex. +2,7 → +2 ; −1,5 → −2).">
      <div className="flex flex-wrap gap-4">
        <Segmented label="Sabot" value={decks} onChange={setDecks} options={[{ value: 2, label: '2 jeux' }, { value: 6, label: '6 jeux' }, { value: 8, label: '8 jeux' }]} />
        <Segmented label="Défausse" value={display} onChange={setDisplay} options={[{ value: 'chiffres', label: 'Jeux restants donnés' }, { value: 'visuel', label: 'Bac de défausse' }]} />
        {display === 'visuel' && <Toggle label="Graduations" checked={scale} onChange={setScale} />}
      </div>
      <div className="felt grid items-center gap-4 rounded-2xl p-6 sm:grid-cols-[auto_1fr]">
        {display === 'visuel' ? (
          <div className="flex justify-center">
            <DiscardTray decks={p.discarded} capacity={p.decks} showScale={scale} label="Bac de défausse" />
          </div>
        ) : (
          <div className="text-center text-emerald-100">
            <div className="text-sm">Jeux restants</div>
            <div className="text-5xl font-bold tabular-nums">{fmt(remaining)}</div>
          </div>
        )}
        <div className="space-y-4 text-center sm:text-left">
          <div className="text-emerald-100">
            <div className="text-sm">Running count</div>
            <div className="text-5xl font-bold tabular-nums">{formatSigned(p.rc)}</div>
            {display === 'visuel' && <div className="mt-1 text-sm">Sabot de {p.decks} jeux</div>}
          </div>
          {!result ? (
            <CountInput key={p.start} label="True count" onSubmit={submit} />
          ) : (
            <Button onClick={next} autoFocus>Suivant →</Button>
          )}
        </div>
      </div>
      {result && (
        <Feedback ok={result.guess === expected}>
          {result.guess === expected ? '✓ Correct' : `✗ Réponse attendue : ${formatSigned(expected)}`} ({(result.ms / 1000).toFixed(1).replace('.', ',')} s).{' '}
          Jeux restants = {p.decks} − {fmt(p.discarded)} = {fmt(remaining)} ; {formatSigned(p.rc)} ÷ {fmt(remaining)} = {formatSigned(trueCount(p.rc, remaining, 'exact'), 2)} → {formatSigned(expected)}.
        </Feedback>
      )}
      <SessionBar stats={stats} />
      <Button variant="ghost" onClick={flush} disabled={stats.answered === 0}>Enregistrer et terminer la séance</Button>
    </ExerciseShell>
  );
}
