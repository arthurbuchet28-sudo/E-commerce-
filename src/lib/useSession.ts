import { useCallback, useEffect, useRef, useState } from 'react';
import { useProgress, type ExerciseId } from './progress';

export interface SessionStats {
  answered: number;
  correct: number;
  totalMs: number;
  streak: number;
  bestStreak: number;
}

const EMPTY: SessionStats = { answered: 0, correct: 0, totalMs: 0, streak: 0, bestStreak: 0 };

/**
 * Suit une séance d'exercice (réponses, justesse, temps) et l'enregistre dans la progression
 * à la fin de la séance ou quand on quitte la page.
 */
export function useSession(id: ExerciseId) {
  const { recordExercise } = useProgress();
  const [stats, setStats] = useState<SessionStats>(EMPTY);
  const ref = useRef(stats);
  ref.current = stats;
  const recordRef = useRef(recordExercise);
  recordRef.current = recordExercise;

  const answer = useCallback((correct: boolean, ms = 0) => {
    setStats((s) => {
      const streak = correct ? s.streak + 1 : 0;
      return {
        answered: s.answered + 1,
        correct: s.correct + (correct ? 1 : 0),
        totalMs: s.totalMs + ms,
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
      };
    });
  }, []);

  const flush = useCallback(() => {
    const s = ref.current;
    if (s.answered > 0) {
      recordRef.current(id, { answered: s.answered, correct: s.correct, score: Math.round((s.correct / s.answered) * 100) });
    }
    ref.current = EMPTY;
    setStats(EMPTY);
  }, [id]);

  useEffect(() => () => {
    const s = ref.current;
    if (s.answered > 0) recordRef.current(id, { answered: s.answered, correct: s.correct, score: Math.round((s.correct / s.answered) * 100) });
  }, [id]);

  return { stats, answer, flush };
}
