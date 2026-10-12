import { useMemo, useState } from 'react';
import type { QuizQuestion } from '../content/types';
import { shuffleInPlace } from '../engine/rng';
import { PASS_THRESHOLD } from '../content/meta';
import { Button, Feedback, ProgressBar } from './ui';
import { RichText } from './RichText';

interface Prepared {
  q: QuizQuestion;
  order: number[]; // ordre d'affichage des choix
}

function prepare(questions: QuizQuestion[]): Prepared[] {
  return shuffleInPlace(questions.map((q) => ({ q, order: shuffleInPlace(q.choices.map((_, i) => i)) })));
}

/**
 * Quiz de validation : questions et réponses mélangées, correction immédiate avec explication.
 */
export function Quiz({ questions, onFinish, title = 'Quiz de validation' }: { questions: QuizQuestion[]; onFinish: (percent: number) => void; title?: string }) {
  const [seed, setSeed] = useState(0);
  const items = useMemo(() => prepare(questions), [questions, seed]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<{ q: QuizQuestion; chosen: number }[]>([]);
  const [done, setDone] = useState(false);

  const current = items[index];

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setMistakes([]);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    const passed = pct >= PASS_THRESHOLD;
    return (
      <div className="space-y-4">
        <Feedback ok={passed}>
          <div className="text-lg font-semibold">
            Score : {score} / {items.length} ({pct} %)
          </div>
          {passed ? 'Bravo ! Module validé : le module suivant est débloqué.' : `Il faut au moins ${PASS_THRESHOLD} % pour valider. Relisez les points ci-dessous et réessayez.`}
        </Feedback>
        {mistakes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">À revoir</h4>
            {mistakes.map(({ q, chosen }, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
                <div className="font-medium text-slate-100"><RichText text={q.question} /></div>
                <div className="mt-1 text-rose-300">Votre réponse : {q.choices[chosen]}</div>
                <div className="text-emerald-300">Bonne réponse : {q.choices[q.answer]}</div>
                <div className="mt-1 text-slate-400"><RichText text={q.explanation} /></div>
              </div>
            ))}
          </div>
        )}
        <Button onClick={restart}>Recommencer le quiz</Button>
      </div>
    );
  }

  const answered = selected !== null;
  const correct = answered && selected === current.q.answer;

  const choose = (i: number) => {
    if (answered) return;
    setSelected(i);
    if (i === current.q.answer) setScore((s) => s + 1);
    else setMistakes((m) => [...m, { q: current.q, chosen: i }]);
  };

  const next = () => {
    if (index + 1 >= items.length) {
      const pct = Math.round((score / items.length) * 100);
      setDone(true);
      onFinish(pct);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{title}</span>
        <span className="tabular-nums">
          Question {index + 1} / {items.length}
        </span>
      </div>
      <ProgressBar value={index / items.length} />
      <div className="text-lg font-medium text-slate-100">
        <RichText text={current.q.question} />
      </div>
      <div className="grid gap-2">
        {current.order.map((ci) => {
          const isAnswer = ci === current.q.answer;
          const isChosen = ci === selected;
          let style = 'border-slate-700 bg-slate-800/60 hover:border-emerald-500 hover:bg-slate-800';
          if (answered) {
            if (isAnswer) style = 'border-emerald-500 bg-emerald-900/50';
            else if (isChosen) style = 'border-rose-500 bg-rose-900/40';
            else style = 'border-slate-800 bg-slate-900/40 opacity-60';
          }
          return (
            <button key={ci} onClick={() => choose(ci)} disabled={answered} className={`rounded-xl border px-4 py-3 text-left text-sm transition sm:text-base ${style}`}>
              {current.q.choices[ci]}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <Feedback ok={correct}>
            <strong>{correct ? 'Correct.' : 'Incorrect.'}</strong> <RichText text={current.q.explanation} />
          </Feedback>
          <Button onClick={next} autoFocus>
            {index + 1 >= items.length ? 'Voir le résultat' : 'Question suivante →'}
          </Button>
        </>
      )}
    </div>
  );
}
