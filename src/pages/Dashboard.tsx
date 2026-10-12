import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EXERCISES, MODULES, PASS_THRESHOLD } from '../content';
import { overallCompletion, useProgress, type ExerciseId } from '../lib/progress';
import { worstSituations } from '../engine/srs';
import { parseSituationKey, situationLabel } from '../engine/strategy';
import { PageHeader } from '../components/Layout';
import { Badge, Button, Panel, ProgressBar, Stat, Toggle } from '../components/ui';
import { formatSeconds } from '../components/Timer';

function bestLabel(id: ExerciseId, best: number | undefined): string {
  if (best === undefined) return '—';
  switch (id) {
    case 'deck-countdown':
      return formatSeconds(best * 1000);
    default:
      return `${Math.round(best)} %`;
  }
}

export function Dashboard() {
  const { progress, isUnlocked, isPassed, setUnlockAll, resetAll, exportData, importData } = useProgress();
  const completion = overallCompletion(progress);
  const nextModule = MODULES.find((m) => !isPassed(m.id) && !m.optional) ?? MODULES.find((m) => !isPassed(m.id));
  const worst = worstSituations(progress.flashStats, 6);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progression-compteur-pro.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader kicker="Tableau de bord" title="Devenez un compteur de cartes compétent" subtitle="Une formation progressive : règles, stratégie de base, Hi-Lo, true count, gestion de la mise, déviations et pratique en conditions réelles." />

      <Panel className="felt border-emerald-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm text-emerald-200">Progression globale</div>
            <div className="text-3xl font-bold text-white">{Math.round(completion * 100)} %</div>
            <ProgressBar value={completion} className="mt-2 max-w-md" />
          </div>
          {nextModule && (
            <Link to={`/module/${nextModule.id}`}>
              <Button variant="gold">
                {progress.quizAttempts[nextModule.id] || progress.lessonsRead[nextModule.id] ? 'Continuer' : 'Commencer'} : module {nextModule.id} →
              </Button>
            </Link>
          )}
        </div>
      </Panel>

      <Panel title="Parcours">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const unlocked = isUnlocked(m.id);
            const passed = isPassed(m.id);
            const best = progress.quizBest[m.id];
            return (
              <li key={m.id}>
                <Link
                  to={`/module/${m.id}`}
                  className={`block h-full rounded-xl border p-3 transition ${passed ? 'border-emerald-700 bg-emerald-950/40' : unlocked ? 'border-slate-700 bg-slate-800/40 hover:border-emerald-600' : 'border-slate-800 bg-slate-900/40 opacity-60'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400">MODULE {m.id}{m.optional ? ' · OPTIONNEL' : ''}</span>
                    {passed ? <Badge tone="green">✓ {best} %</Badge> : unlocked ? (best !== undefined ? <Badge tone="amber">{best} %</Badge> : <Badge>À faire</Badge>) : <Badge>🔒</Badge>}
                  </div>
                  <div className="mt-1 font-semibold text-slate-100">{m.title}</div>
                  <div className="text-xs text-slate-400">{m.subtitle}</div>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-slate-500">Chaque module se débloque avec au moins {PASS_THRESHOLD} % au quiz du module précédent.</p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Exercices" actions={<Link to="/exercices" className="text-sm text-emerald-300 hover:underline">Tous les exercices →</Link>}>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.map((e) => {
              const rec = progress.exercises[e.id];
              const acc = rec && rec.answered > 0 ? Math.round((rec.correct / rec.answered) * 100) : undefined;
              return (
                <Link key={e.id} to={e.path} className="rounded-xl bg-slate-800/60 px-3 py-2 transition hover:bg-slate-800">
                  <div className="truncate text-xs text-slate-400">{e.title}</div>
                  <div className="text-sm font-semibold text-slate-100 tabular-nums">
                    {e.id === 'card-stream' && progress.streamLevel > 1
                      ? `Niveau ${progress.streamLevel} atteint`
                      : rec
                        ? e.id === 'deck-countdown'
                          ? `Record : ${bestLabel(e.id, rec.best)}`
                          : `${acc ?? '—'} % juste`
                        : 'Pas encore fait'}
                  </div>
                  {rec && <div className="text-xs text-slate-500">{rec.attempts} séance(s)</div>}
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title="Stratégie de base : mains à revoir">
          {worst.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune erreur enregistrée pour l'instant. Lancez les <Link to="/exercices/flash-cards" className="text-emerald-300 hover:underline">flash cards</Link> !</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {worst.map((w) => (
                <li key={w.key} className="flex justify-between gap-2">
                  <span className="text-slate-300">{situationLabel(parseSituationKey(w.key))}</span>
                  <span className="text-rose-300 tabular-nums">{w.stat.errors}/{w.stat.seen} erreurs</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Situations vues" value={Object.keys(progress.flashStats).length} />
            <Stat label="Réponses données" value={Object.values(progress.flashStats).reduce((s, x) => s + x.seen, 0)} />
          </div>
        </Panel>
      </div>

      <Panel title="Paramètres et sauvegarde">
        <div className="space-y-3">
          <Toggle label="Déverrouiller tous les modules (si vous connaissez déjà les bases)" checked={progress.unlockAll} onChange={setUnlockAll} />
          <p className="text-xs text-slate-500">Votre progression est enregistrée dans ce navigateur (localStorage). Exportez-la pour la conserver ou la transférer.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={download}>Exporter la progression</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>Importer…</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const ok = importData(await f.text());
                setMsg(ok ? 'Progression importée.' : 'Fichier invalide.');
                e.target.value = '';
              }}
            />
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm('Effacer toute votre progression ? Cette action est irréversible.')) {
                  resetAll();
                  setMsg('Progression effacée.');
                }
              }}
            >
              Tout réinitialiser
            </Button>
          </div>
          {msg && <p className="text-sm text-amber-300" role="status">{msg}</p>}
        </div>
      </Panel>

      <p className="pb-4 text-center text-xs text-slate-500">
        Outil pédagogique. Le jeu comporte des risques : endettement, dépendance… Appelez le 09 74 75 13 13 (Joueurs Info Service, appel non surtaxé).
      </p>
    </div>
  );
}
