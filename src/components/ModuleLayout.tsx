import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CourseModule } from '../content/types';
import { MODULES, PASS_THRESHOLD, getExercise } from '../content';
import { useProgress } from '../lib/progress';
import { BlockRenderer } from './BlockRenderer';
import { Quiz } from './Quiz';
import { Badge, Button, Panel } from './ui';
import { RichText } from './RichText';
import { PageHeader } from './Layout';

type Tab = 'cours' | 'exercices' | 'quiz';

/**
 * Gabarit commun à toutes les pages de module : objectifs, cours, points clés,
 * erreurs fréquentes, exercices et quiz de validation.
 */
export function ModuleLayout({ module: m, widgets = {} }: { module: CourseModule; widgets?: Record<string, ReactNode> }) {
  const { isUnlocked, isPassed, progress, recordQuiz, markLessonRead, setUnlockAll } = useProgress();
  const [tab, setTab] = useState<Tab>('cours');
  const unlocked = isUnlocked(m.id);
  const passed = isPassed(m.id);
  const best = progress.quizBest[m.id];
  const prev = MODULES.find((x) => x.id === m.id - 1);
  const next = MODULES.find((x) => x.id === m.id + 1);

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader kicker={`Module ${m.id}`} title={m.title} subtitle={m.subtitle} />
        <Panel>
          <p className="text-slate-300">
            🔒 Ce module se débloque lorsque vous obtenez au moins <strong>{PASS_THRESHOLD} %</strong> au quiz du module {m.id - 1}
            {prev ? ` (« ${prev.title} »)` : ''}.
          </p>
          <h3 className="mt-4 mb-2 font-semibold text-slate-200">Au programme</h3>
          <ul className="list-disc space-y-1 pl-5 text-slate-400">
            {m.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {prev && (
              <Link to={`/module/${prev.id}`}>
                <Button>Aller au module {prev.id}</Button>
              </Link>
            )}
            <Button variant="ghost" onClick={() => setUnlockAll(true)} title="Pour les joueurs qui connaissent déjà les bases">
              Déverrouiller tous les modules
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader kicker={`Module ${m.id}${m.optional ? ' · optionnel' : ''} · ${m.duration}`} title={m.title} subtitle={m.subtitle} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {passed ? <Badge tone="green">Validé ✓</Badge> : <Badge tone="amber">À valider</Badge>}
        {best !== undefined && <Badge>Meilleur score au quiz : {best} %</Badge>}
        {progress.lessonsRead[m.id] && <Badge tone="blue">Cours lu</Badge>}
      </div>

      <div className="sticky top-[57px] z-10 -mx-4 mb-5 border-b border-slate-800 bg-slate-950/95 px-4 py-2 backdrop-blur lg:top-0">
        <div className="flex gap-1" role="tablist">
          {(
            [
              ['cours', '📖 Cours'],
              ['exercices', '🎯 Exercices'],
              ['quiz', `✍️ Quiz (${m.quiz.length})`],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === t ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'cours' && (
        <div className="space-y-6">
          <Panel title="🎯 Objectifs">
            <ul className="list-disc space-y-1 pl-5 text-slate-300 marker:text-emerald-500">
              {m.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
            <nav className="mt-4 border-t border-slate-800 pt-3" aria-label="Sommaire">
              <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Sommaire</div>
              <ol className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                {m.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }} className="text-emerald-300 hover:underline">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Panel>

          {m.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 space-y-3">
              <h3 className="font-display text-xl font-bold text-slate-50">
                <span className="mr-2 text-emerald-400">{i + 1}.</span>
                {s.title}
              </h3>
              {s.blocks.map((b, j) => (
                <BlockRenderer key={j} block={b} renderWidget={(id) => widgets[id] ?? <MissingWidget id={id} />} />
              ))}
            </section>
          ))}

          <Panel title="📌 Points clés à retenir" className="border-emerald-800/60">
            <ul className="space-y-2">
              {m.keyPoints.map((k, i) => (
                <li key={i} className="flex gap-2 text-slate-300">
                  <span className="text-emerald-400">✔</span>
                  <span><RichText text={k} /></span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="⚠️ Erreurs fréquentes" className="border-rose-900/60">
            <div className="space-y-3">
              {m.mistakes.map((x, i) => (
                <div key={i} className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                  <div className="text-rose-300">✗ <RichText text={x.mistake} /></div>
                  <div className="text-emerald-300">→ <RichText text={x.fix} /></div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                markLessonRead(m.id);
                setTab('exercices');
                window.scrollTo(0, 0);
              }}
            >
              J'ai terminé le cours → exercices
            </Button>
            <Button variant="secondary" onClick={() => { markLessonRead(m.id); setTab('quiz'); window.scrollTo(0, 0); }}>
              Passer au quiz
            </Button>
          </div>
        </div>
      )}

      {tab === 'exercices' && (
        <div className="space-y-4">
          <p className="text-slate-400">Exercices recommandés pour ce module. Entraînez-vous jusqu'à atteindre l'objectif, puis passez le quiz.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {m.exercises.map((e) => {
              const info = getExercise(e.id);
              const rec = progress.exercises[e.id];
              return (
                <Link key={e.id} to={info.path} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-emerald-600">
                  <div className="font-semibold text-slate-100 group-hover:text-emerald-300">{e.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{info.description}</div>
                  <div className="mt-2 text-sm text-amber-300">🎯 {e.goal}</div>
                  {rec && <div className="mt-1 text-xs text-slate-500">{rec.attempts} séance(s) réalisée(s)</div>}
                </Link>
              );
            })}
          </div>
          <Button variant="secondary" onClick={() => setTab('quiz')}>Passer au quiz →</Button>
        </div>
      )}

      {tab === 'quiz' && (
        <Panel>
          <p className="mb-4 text-sm text-slate-400">
            {m.quiz.length} questions. Il faut au moins {PASS_THRESHOLD} % de bonnes réponses pour valider le module{next ? ' et débloquer le suivant' : ''}. Chaque réponse est expliquée.
          </p>
          <Quiz questions={m.quiz} onFinish={(pct) => recordQuiz(m.id, pct)} />
        </Panel>
      )}

      <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-slate-800 pt-4">
        {prev ? (
          <Link to={`/module/${prev.id}`} className="text-sm text-slate-400 hover:text-emerald-300">
            ← Module {prev.id} : {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/module/${next.id}`} className="text-sm text-slate-400 hover:text-emerald-300">
            Module {next.id} : {next.title} {isUnlocked(next.id) ? '→' : '🔒'}
          </Link>
        )}
      </div>
    </div>
  );
}

function MissingWidget({ id }: { id: string }) {
  return <div className="text-xs text-slate-500">[{id}]</div>;
}
