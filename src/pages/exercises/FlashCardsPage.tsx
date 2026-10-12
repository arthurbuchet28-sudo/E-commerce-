import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseShell, SessionBar } from '../../components/ExerciseShell';
import { Hand } from '../../components/Hand';
import { Button, Feedback, Panel, Segmented } from '../../components/ui';
import { useSession } from '../../lib/useSession';
import { useProgress } from '../../lib/progress';
import { REFERENCE_RULES, rulesLabel } from '../../engine/rules';
import { cardsForSituation, randomSituation } from '../../engine/situations';
import { dueForReview, worstSituations } from '../../engine/srs';
import { pick } from '../../engine/rng';
import {
  ACTION_LABELS,
  type Action,
  type HandKind,
  type Situation,
  explainSituation,
  parseSituationKey,
  situationAction,
  situationKey,
  situationLabel,
} from '../../engine/strategy';
import type { Card } from '../../engine/cards';

type Mode = 'mixte' | 'revision';
type Filter = 'all' | HandKind;

interface Question {
  situation: Situation;
  player: Card[];
  dealer: Card;
  start: number;
}

const KEYS: Record<string, Action> = { t: 'H', r: 'S', d: 'D', s: 'P', a: 'R' };
const KEY_HINT: Record<Action, string> = { H: 'T', S: 'R', D: 'D', P: 'S', R: 'A' };

export function FlashCardsPage() {
  const { progress, recordFlash } = useProgress();
  const { stats, answer, flush } = useSession('flashcards');
  const [mode, setMode] = useState<Mode>('mixte');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState<Question | null>(null);
  const [result, setResult] = useState<{ chosen: Action; correct: Action; ms: number } | null>(null);
  const [byKind, setByKind] = useState<Record<HandKind, { n: number; err: number }>>({ hard: { n: 0, err: 0 }, soft: { n: 0, err: 0 }, pair: { n: 0, err: 0 } });
  const statsRef = useRef(progress.flashStats);
  statsRef.current = progress.flashStats;
  const tickRef = useRef(progress.flashTick);
  tickRef.current = progress.flashTick;

  const due = useMemo(() => dueForReview(progress.flashStats, progress.flashTick), [progress.flashStats, progress.flashTick]);

  const nextQuestion = useCallback(() => {
    const kinds: HandKind[] = filter === 'all' ? ['hard', 'soft', 'pair'] : [filter];
    const dueNow = dueForReview(statsRef.current, tickRef.current).filter((k) => kinds.includes(parseSituationKey(k).kind));
    let s: Situation;
    if (mode === 'revision') {
      const pool = dueNow.length > 0 ? dueNow.slice(0, 8) : worstSituations(statsRef.current, 15).map((w) => w.key).filter((k) => kinds.includes(parseSituationKey(k).kind));
      s = pool.length > 0 ? parseSituationKey(pick(pool)) : randomSituation(Math.random, kinds);
    } else if (dueNow.length > 0 && Math.random() < 0.3) {
      s = parseSituationKey(dueNow[0]);
    } else {
      s = randomSituation(Math.random, kinds);
    }
    const { player, dealer } = cardsForSituation(s);
    setQ({ situation: s, player, dealer, start: performance.now() });
    setResult(null);
  }, [filter, mode]);

  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  const choose = useCallback(
    (a: Action) => {
      if (!q || result) return;
      const opts = { canDouble: true, canSplit: q.situation.kind === 'pair', canSurrender: true };
      const correct = situationAction(q.situation, REFERENCE_RULES, opts);
      const ms = performance.now() - q.start;
      const ok = a === correct;
      setResult({ chosen: a, correct, ms });
      answer(ok, ms);
      recordFlash(situationKey(q.situation), ok);
      setByKind((b) => ({ ...b, [q.situation.kind]: { n: b[q.situation.kind].n + 1, err: b[q.situation.kind].err + (ok ? 0 : 1) } }));
    },
    [q, result, answer, recordFlash],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (result && (k === 'enter' || k === ' ')) {
        e.preventDefault();
        nextQuestion();
      } else if (!result && KEYS[k]) {
        choose(KEYS[k]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, result, nextQuestion]);

  const worst = worstSituations(progress.flashStats, 8);

  return (
    <ExerciseShell id="flashcards" intro={<>Configuration : {rulesLabel(REFERENCE_RULES)}. On suppose que c'est votre main de départ (doubler et abandonner sont possibles). Raccourcis clavier : T (tirer), R (rester), D (doubler), S (séparer), A (abandonner), Entrée (suivante).</>}>
      <div className="flex flex-wrap gap-4">
        <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: 'mixte', label: 'Aléatoire + révisions' }, { value: 'revision', label: `Révision ciblée (${due.length})` }]} />
        <Segmented label="Mains" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Toutes' }, { value: 'hard', label: 'Dures' }, { value: 'soft', label: 'Soft' }, { value: 'pair', label: 'Paires' }]} />
      </div>

      {q && (
        <div className="felt rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col items-center gap-6">
            <Hand cards={[q.dealer]} label="Croupier" size="lg" />
            <Hand cards={q.player} label="Vous" size="lg" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(['H', 'S', 'D', 'P', 'R'] as Action[]).map((a) => {
              const disabled = a === 'P' && q.situation.kind !== 'pair';
              let style = '';
              if (result) {
                if (a === result.correct) style = 'ring-2 ring-emerald-400';
                else if (a === result.chosen) style = 'ring-2 ring-rose-500';
              }
              return (
                <Button key={a} variant={a === 'R' ? 'ghost' : 'secondary'} className={`py-3 text-base ${style}`} disabled={disabled || !!result} onClick={() => choose(a)}>
                  {ACTION_LABELS[a]} <kbd className="hidden rounded bg-black/30 px-1 text-xs sm:inline">{KEY_HINT[a]}</kbd>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {q && result && (
        <div className="space-y-2">
          <Feedback ok={result.chosen === result.correct}>
            <div className="font-semibold">
              {result.chosen === result.correct ? '✓ Correct' : `✗ Il fallait : ${ACTION_LABELS[result.correct]}`} — {situationLabel(q.situation)} — {(result.ms / 1000).toFixed(1).replace('.', ',')} s
            </div>
            <div className="mt-1">{explainSituation(q.situation, result.correct, REFERENCE_RULES)}</div>
          </Feedback>
          <Button onClick={nextQuestion} autoFocus>Main suivante →</Button>
        </div>
      )}

      <SessionBar stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Erreurs de la séance par type">
          <ul className="space-y-1 text-sm">
            {(['hard', 'soft', 'pair'] as HandKind[]).map((k) => (
              <li key={k} className="flex justify-between">
                <span className="text-slate-300">{k === 'hard' ? 'Mains dures' : k === 'soft' ? 'Mains soft' : 'Paires'}</span>
                <span className="tabular-nums text-slate-400">
                  {byKind[k].err} erreur(s) / {byKind[k].n}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="mt-3" onClick={flush} disabled={stats.answered === 0}>Enregistrer et terminer la séance</Button>
        </Panel>
        <Panel title="Situations les plus ratées (historique)">
          {worst.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune erreur pour l'instant.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {worst.map((w) => (
                <li key={w.key} className="flex justify-between gap-2">
                  <span className="text-slate-300">{situationLabel(parseSituationKey(w.key))}</span>
                  <span className="tabular-nums text-rose-300">{Math.round(w.errorRate * 100)} % ({w.stat.errors}/{w.stat.seen})</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-slate-500">Répétition espacée : une situation ratée revient après ~3 questions, puis de plus en plus rarement à chaque bonne réponse.</p>
        </Panel>
      </div>
    </ExerciseShell>
  );
}
