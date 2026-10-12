import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ExerciseId } from '../lib/progress';
import { getExercise } from '../content';
import { PageHeader } from './Layout';
import { Stat } from './ui';
import type { SessionStats } from '../lib/useSession';

export function ExerciseShell({ id, children, intro }: { id: ExerciseId; children: ReactNode; intro?: ReactNode }) {
  const info = getExercise(id);
  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/exercices" className="text-sm text-slate-400 hover:text-emerald-300">← Exercices</Link>
      <PageHeader kicker={`Exercice · module ${info.module}`} title={info.title} subtitle={info.description} />
      <div className="mb-4 rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-2 text-sm text-amber-200">🎯 Objectif : {info.goal}</div>
      {intro && <div className="mb-4 text-sm text-slate-400">{intro}</div>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function SessionBar({ stats, extra }: { stats: SessionStats; extra?: ReactNode }) {
  const acc = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
  const avg = stats.answered ? (stats.totalMs / stats.answered / 1000).toFixed(1).replace('.', ',') : '—';
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label="Réponses" value={stats.answered} />
      <Stat label="Justesse" value={`${acc} %`} />
      <Stat label="Temps moyen" value={`${avg} s`} />
      <Stat label="Série" value={stats.streak} hint={`record de la séance : ${stats.bestStreak}`} />
      {extra}
    </div>
  );
}
