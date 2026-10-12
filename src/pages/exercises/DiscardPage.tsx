import { useCallback, useEffect, useState } from 'react';
import { ExerciseShell, SessionBar } from '../../components/ExerciseShell';
import { DiscardTray } from '../../components/DiscardTray';
import { Button, Feedback, Segmented } from '../../components/ui';
import { useSession } from '../../lib/useSession';
import { randInt } from '../../engine/rng';

export function DiscardPage() {
  const { stats, answer, flush } = useSession('discard');
  const [decks, setDecks] = useState(6);
  const [cards, setCards] = useState(0);
  const [start, setStart] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);

  const next = useCallback(() => {
    setCards(randInt(20, Math.floor(decks * 52 * 0.9)));
    setGuess(null);
    setStart(performance.now());
  }, [decks]);

  useEffect(() => {
    next();
  }, [next]);

  const actual = cards / 52;
  const nearestHalf = Math.round(actual * 2) / 2;
  const options = Array.from({ length: decks * 2 }, (_, i) => (i + 1) / 2).filter((v) => v < decks);
  const fmt = (n: number) => n.toString().replace('.', ',');
  const ok = guess !== null && Math.abs(guess - actual) <= 0.5;
  const perfect = guess !== null && guess === nearestHalf;

  const choose = (v: number) => {
    if (guess !== null) return;
    setGuess(v);
    answer(Math.abs(v - actual) <= 0.5, performance.now() - start);
  };

  return (
    <ExerciseShell id="discard" intro="Estimez combien de jeux se trouvent dans le bac de défausse, au demi-jeu près. Une erreur d'un demi-jeu au plus est acceptée. Après chaque réponse, les graduations apparaissent pour calibrer votre œil.">
      <Segmented label="Sabot" value={decks} onChange={setDecks} options={[{ value: 6, label: '6 jeux' }, { value: 8, label: '8 jeux' }]} />
      <div className="felt grid items-center gap-4 rounded-2xl p-6 sm:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <DiscardTray decks={actual} capacity={decks} showScale={guess !== null} label="Bac de défausse à estimer" />
        </div>
        <div className="space-y-3">
          <div className="text-emerald-100">Combien de jeux dans la défausse ?</div>
          <div className="flex flex-wrap gap-1.5">
            {options.map((v) => (
              <Button
                key={v}
                variant={guess !== null && v === nearestHalf ? 'primary' : guess === v ? 'danger' : 'secondary'}
                disabled={guess !== null}
                onClick={() => choose(v)}
                className="min-w-14"
              >
                {fmt(v)}
              </Button>
            ))}
          </div>
          {guess !== null && (
            <>
              <Feedback ok={ok}>
                {perfect ? '✓ Parfait.' : ok ? '✓ Acceptable (à moins d\'un demi-jeu).' : '✗ Trop loin.'} Il y avait {cards} cartes, soit {fmt(Math.round(actual * 100) / 100)} jeux (≈ {fmt(nearestHalf)}). Jeux restants : ≈ {fmt(decks - nearestHalf)}.
              </Feedback>
              <Button onClick={next} autoFocus>Suivant →</Button>
            </>
          )}
        </div>
      </div>
      <SessionBar stats={stats} />
      <Button variant="ghost" onClick={flush} disabled={stats.answered === 0}>Enregistrer et terminer la séance</Button>
    </ExerciseShell>
  );
}
