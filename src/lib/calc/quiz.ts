import { MODEL_ORDER, quizQuestions, type ModelId, type QuizQuestion } from "@/data/quiz-modele";

export type QuizAnswers = Record<string, string>;

/** Sums the points of each answer; unknown answers are ignored. */
export function scoreQuiz(
  answers: QuizAnswers,
  questions: QuizQuestion[] = quizQuestions,
): Record<ModelId, number> {
  const scores = Object.fromEntries(MODEL_ORDER.map((m) => [m, 0])) as Record<ModelId, number>;
  for (const q of questions) {
    const option = q.options.find((o) => o.id === answers[q.id]);
    for (const [model, points] of Object.entries(option?.scores ?? {}))
      scores[model as ModelId] += points;
  }
  return scores;
}

/** Models sorted by score, ties broken by lower financial risk. */
export function rankModels(
  answers: QuizAnswers,
  questions: QuizQuestion[] = quizQuestions,
): ModelId[] {
  const scores = scoreQuiz(answers, questions);
  return [...MODEL_ORDER].sort(
    (a, b) => scores[b] - scores[a] || MODEL_ORDER.indexOf(a) - MODEL_ORDER.indexOf(b),
  );
}

export function isComplete(
  answers: QuizAnswers,
  questions: QuizQuestion[] = quizQuestions,
): boolean {
  return questions.every((q) => q.options.some((o) => o.id === answers[q.id]));
}
