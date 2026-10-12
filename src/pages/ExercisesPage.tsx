import { Link } from 'react-router-dom';
import { EXERCISES, getModule } from '../content';
import { PageHeader } from '../components/Layout';
import { useProgress } from '../lib/progress';
import { Badge } from '../components/ui';

export function ExercisesPage() {
  const { progress, isUnlocked } = useProgress();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader kicker="Pratique" title="Exercices interactifs" subtitle="Tous les exercices sont accessibles à tout moment. Le module conseillé indique quand ils deviennent pertinents." />
      <div className="grid gap-4 sm:grid-cols-2">
        {EXERCISES.map((e) => {
          const rec = progress.exercises[e.id];
          const ready = isUnlocked(e.module);
          return (
            <Link key={e.id} to={e.path} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-600">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-slate-100 group-hover:text-emerald-300">{e.title}</h2>
                <Badge tone={ready ? 'green' : 'slate'}>Module {e.module}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-400">{e.description}</p>
              <p className="mt-2 text-sm text-amber-300">🎯 Objectif : {e.goal}</p>
              {!ready && <p className="mt-1 text-xs text-slate-500">Conseillé après « {getModule(e.module)?.title} ».</p>}
              {rec && <p className="mt-1 text-xs text-slate-500">{rec.attempts} séance(s) · {rec.answered > 0 ? `${Math.round((rec.correct / rec.answered) * 100)} % de réponses justes` : ''}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
