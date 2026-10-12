import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readJson, removeKey, writeJson } from './storage';
import { type StatsMap, recordAnswer } from '../engine/srs';
import { type TrueCountMethod } from '../engine/count';
import { MODULE_COUNT, PASS_THRESHOLD } from '../content/meta';

export type ExerciseId =
  | 'flashcards'
  | 'card-stream'
  | 'deck-countdown'
  | 'groups'
  | 'true-count'
  | 'discard'
  | 'deviation-quiz'
  | 'simulator';

export interface ExerciseRecord {
  attempts: number;
  /** Nombre total de réponses / bonnes réponses. */
  answered: number;
  correct: number;
  /** Meilleur score (sens dépendant de l'exercice : % ou secondes). */
  best?: number;
  /** Derniers résultats (score, date ISO). */
  history: { score: number; date: string }[];
}

export interface Progress {
  version: 1;
  quizBest: Record<number, number>;
  quizAttempts: Record<number, number>;
  lessonsRead: Record<number, boolean>;
  unlockAll: boolean;
  flashStats: StatsMap;
  flashTick: number;
  exercises: Partial<Record<ExerciseId, ExerciseRecord>>;
  streamLevel: number;
  tcMethod: TrueCountMethod;
}

const KEY = 'compteur-pro:progression:v1';

const EMPTY: Progress = {
  version: 1,
  quizBest: {},
  quizAttempts: {},
  lessonsRead: {},
  unlockAll: false,
  flashStats: {},
  flashTick: 0,
  exercises: {},
  streamLevel: 1,
  tcMethod: 'floor',
};

function load(): Progress {
  const data = readJson<Partial<Progress> | null>(KEY, null);
  if (!data || data.version !== 1) return EMPTY;
  return { ...EMPTY, ...data };
}

interface ProgressApi {
  progress: Progress;
  isUnlocked: (moduleId: number) => boolean;
  isPassed: (moduleId: number) => boolean;
  recordQuiz: (moduleId: number, percent: number) => void;
  markLessonRead: (moduleId: number) => void;
  setUnlockAll: (v: boolean) => void;
  recordFlash: (key: string, correct: boolean) => void;
  /** Enregistre une session d'exercice. `lowerIsBetter` pour les chronos. */
  recordExercise: (id: ExerciseId, r: { answered: number; correct: number; score?: number; lowerIsBetter?: boolean }) => void;
  setStreamLevel: (level: number) => void;
  setTcMethod: (m: TrueCountMethod) => void;
  resetAll: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(load);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeJson(KEY, progress);
  }, [progress]);

  const isPassed = useCallback((id: number) => (progress.quizBest[id] ?? 0) >= PASS_THRESHOLD, [progress.quizBest]);

  const isUnlocked = useCallback(
    (id: number) => {
      if (id <= 1 || progress.unlockAll) return true;
      return (progress.quizBest[id - 1] ?? 0) >= PASS_THRESHOLD;
    },
    [progress.quizBest, progress.unlockAll],
  );

  const api = useMemo<ProgressApi>(
    () => ({
      progress,
      isUnlocked,
      isPassed,
      recordQuiz: (id, percent) =>
        setProgress((p) => ({
          ...p,
          quizBest: { ...p.quizBest, [id]: Math.max(p.quizBest[id] ?? 0, percent) },
          quizAttempts: { ...p.quizAttempts, [id]: (p.quizAttempts[id] ?? 0) + 1 },
        })),
      markLessonRead: (id) =>
        setProgress((p) => (p.lessonsRead[id] ? p : { ...p, lessonsRead: { ...p.lessonsRead, [id]: true } })),
      setUnlockAll: (v) => setProgress((p) => ({ ...p, unlockAll: v })),
      recordFlash: (key, correct) =>
        setProgress((p) => ({
          ...p,
          flashTick: p.flashTick + 1,
          flashStats: recordAnswer(p.flashStats, key, correct, p.flashTick + 1),
        })),
      recordExercise: (id, r) =>
        setProgress((p) => {
          const prev: ExerciseRecord = p.exercises[id] ?? { attempts: 0, answered: 0, correct: 0, history: [] };
          let best = prev.best;
          if (r.score !== undefined) {
            if (best === undefined) best = r.score;
            else best = r.lowerIsBetter ? Math.min(best, r.score) : Math.max(best, r.score);
          }
          const history =
            r.score !== undefined ? [...prev.history, { score: r.score, date: new Date().toISOString() }].slice(-30) : prev.history;
          return {
            ...p,
            exercises: {
              ...p.exercises,
              [id]: {
                attempts: prev.attempts + 1,
                answered: prev.answered + r.answered,
                correct: prev.correct + r.correct,
                best,
                history,
              },
            },
          };
        }),
      setStreamLevel: (level) => setProgress((p) => ({ ...p, streamLevel: Math.max(p.streamLevel, level) })),
      setTcMethod: (m) => setProgress((p) => ({ ...p, tcMethod: m })),
      resetAll: () => {
        removeKey(KEY);
        setProgress(EMPTY);
      },
      exportData: () => JSON.stringify(progress, null, 2),
      importData: (json) => {
        try {
          const data = JSON.parse(json) as Progress;
          if (data.version !== 1) return false;
          setProgress({ ...EMPTY, ...data });
          return true;
        } catch {
          return false;
        }
      },
    }),
    [progress, isUnlocked, isPassed],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress doit être utilisé dans ProgressProvider');
  return v;
}

export function overallCompletion(p: Progress): number {
  let passed = 0;
  for (let i = 1; i <= MODULE_COUNT; i++) if ((p.quizBest[i] ?? 0) >= PASS_THRESHOLD) passed++;
  return passed / MODULE_COUNT;
}
