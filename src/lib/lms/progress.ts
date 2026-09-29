/** Pure course-progress logic (unit-tested), independent from the database. */

export type LessonRef = { id: string; slug: string; moduleId: string; title: string };
export type ModuleRef = { id: string; position: number; title: string; hasQuiz: boolean };

export type CourseProgress = {
  completedLessons: number;
  totalLessons: number;
  passedQuizzes: number;
  totalQuizzes: number;
  percent: number;
  complete: boolean;
  /** Slug of the lesson to resume: first not completed, else the last seen, else the first. */
  resumeSlug: string | null;
};

export function quizSlug(modulePosition: number): string {
  return `quiz-module-${modulePosition}`;
}

export function parseQuizSlug(slug: string): number | null {
  const m = /^quiz-module-(\d{1,2})$/.exec(slug);
  return m ? Number(m[1]) : null;
}

export function courseProgress(
  modules: ModuleRef[],
  lessons: LessonRef[],
  completed: ReadonlySet<string>,
  passedModules: ReadonlySet<string>,
  lastSeenLessonId?: string | null,
): CourseProgress {
  const completedLessons = lessons.filter((l) => completed.has(l.id)).length;
  const quizModules = modules.filter((m) => m.hasQuiz);
  const passedQuizzes = quizModules.filter((m) => passedModules.has(m.id)).length;
  const total = lessons.length + quizModules.length;
  const done = completedLessons + passedQuizzes;
  const firstTodo = lessons.find((l) => !completed.has(l.id));
  const lastSeen = lessons.find((l) => l.id === lastSeenLessonId);
  const moduleWithPendingQuiz = quizModules
    .sort((a, b) => a.position - b.position)
    .find(
      (m) =>
        !passedModules.has(m.id) &&
        lessons.filter((l) => l.moduleId === m.id).every((l) => completed.has(l.id)),
    );
  return {
    completedLessons,
    totalLessons: lessons.length,
    passedQuizzes,
    totalQuizzes: quizModules.length,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    complete: total > 0 && done === total,
    resumeSlug: moduleWithPendingQuiz
      ? quizSlug(moduleWithPendingQuiz.position)
      : (firstTodo?.slug ?? lastSeen?.slug ?? lessons[0]?.slug ?? null),
  };
}

/** Ordered sequence of the course: each module's lessons followed by its quiz. */
export function courseSequence(
  modules: ModuleRef[],
  lessons: LessonRef[],
): Array<{ slug: string; title: string; kind: "lesson" | "quiz" }> {
  return [...modules]
    .sort((a, b) => a.position - b.position)
    .flatMap((m) => [
      ...lessons
        .filter((l) => l.moduleId === m.id)
        .map((l) => ({ slug: l.slug, title: l.title, kind: "lesson" as const })),
      ...(m.hasQuiz
        ? [{ slug: quizSlug(m.position), title: `Quiz · ${m.title}`, kind: "quiz" as const }]
        : []),
    ]);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

export function formatPrice(cents: number | null): string | null {
  if (cents === null) return null;
  const euros = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
  return `${euros} TTC`;
}
