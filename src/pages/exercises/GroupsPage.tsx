import { useCallback, useEffect, useState } from 'react';
import { ExerciseShell, SessionBar } from '../../components/ExerciseShell';
import { PlayingCard } from '../../components/PlayingCard';
import { Button, Feedback, Segmented, Toggle, formatSigned } from '../../components/ui';
import { useSession } from '../../lib/useSession';
import { type Card, createShuffledDeck } from '../../engine/cards';
import { hiLoValue, runningCount } from '../../engine/count';
import { randInt } from '../../engine/rng';

type Size = 2 | 3 | 4 | 0; // 0 = mixte

export function GroupsPage() {
  const { stats, answer, flush } = useSession('groups');
  const [size, setSize] = useState<Size>(2);
  const [flash, setFlash] = useState(false);
  const [group, setGroup] = useState<Card[]>([]);
  const [hidden, setHidden] = useState(false);
  const [start, setStart] = useState(0);
  const [result, setResult] = useState<{ guess: number; ms: number } | null>(null);

  const next = useCallback(() => {
    const n = size === 0 ? randInt(2, 4) : size;
    setGroup(createShuffledDeck().slice(0, n));
    setResult(null);
    setHidden(false);
    setStart(performance.now());
  }, [size]);

  useEffect(() => {
    next();
  }, [next]);

  useEffect(() => {
    if (!flash || result) return;
    const id = window.setTimeout(() => setHidden(true), 400 + group.length * 150);
    return () => window.clearTimeout(id);
  }, [flash, group, result]);

  const value = runningCount(group);
  const maxAbs = size === 0 ? 4 : size;
  const options = Array.from({ length: maxAbs * 2 + 1 }, (_, i) => i - maxAbs);

  const choose = useCallback(
    (v: number) => {
      if (result) return;
      const ms = performance.now() - start;
      setResult({ guess: v, ms });
      answer(v === value, ms);
    },
    [result, start, answer, value],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, next]);

  return (
    <ExerciseShell id="groups" intro="Regardez le groupe de cartes et donnez sa valeur Hi-Lo totale d'un seul coup d'œil. Cherchez les annulations (une haute + une basse = 0).">
      <div className="flex flex-wrap gap-4">
        <Segmented label="Cartes par groupe" value={size} onChange={setSize} options={[{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 0, label: 'Mixte' }]} />
        <Toggle label="Mode flash (les cartes disparaissent)" checked={flash} onChange={setFlash} />
      </div>
      <div className="felt flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl p-6">
        <div className="flex min-h-36 gap-2">
          {hidden && !result ? (
            <div className="flex items-center text-emerald-200">Quelle était la valeur ?</div>
          ) : (
            group.map((c, i) => <PlayingCard key={`${start}-${i}`} card={c} size="lg" />)
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {options.map((v) => (
            <Button
              key={v}
              variant={result && v === value ? 'primary' : result && v === result.guess ? 'danger' : 'secondary'}
              className="min-w-12"
              disabled={!!result}
              onClick={() => choose(v)}
            >
              {formatSigned(v)}
            </Button>
          ))}
        </div>
      </div>
      {result && (
        <>
          <Feedback ok={result.guess === value}>
            {result.guess === value ? '✓ Correct' : `✗ Valeur : ${formatSigned(value)}`} ({(result.ms / 1000).toFixed(2).replace('.', ',')} s) —{' '}
            {group.map((c) => `${c.rank} (${formatSigned(hiLoValue(c))})`).join(' + ')}
          </Feedback>
          <Button onClick={next} autoFocus>Groupe suivant →</Button>
        </>
      )}
      <SessionBar stats={stats} />
      <Button variant="ghost" onClick={flush} disabled={stats.answered === 0}>Enregistrer et terminer la séance</Button>
    </ExerciseShell>
  );
}
