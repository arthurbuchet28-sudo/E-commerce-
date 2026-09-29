"use client";

import { CircleCheck, CircleX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { submitQuiz, type QuizResult } from "@/app/apprendre/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

type Question = { id: string; prompt: string; choices: string[] };

/** Module quiz: answers are graded by the database; corrections are shown after submitting. */
export function QuizForm({
  moduleId,
  questions,
  passScore,
  nextHref,
  nextLabel,
}: {
  moduleId: string;
  questions: Question[];
  passScore: number;
  nextHref: Route;
  nextLabel: string;
}) {
  const [result, action, pending] = useActionState(submitQuiz, { status: "idle" } as QuizResult);
  // Result the member chose to dismiss (« Recommencer »); a new submission produces a new object.
  const [dismissed, setDismissed] = useState<QuizResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const graded = result.status === "graded" && result !== dismissed;

  useEffect(() => {
    if (result.status === "graded") heading.current?.focus();
  }, [result]);

  if (graded) {
    const byId = new Map(result.questions!.map((q) => [q.questionId, q]));
    return (
      <div className="flex flex-col gap-6">
        <div
          className={cn(
            "rounded-ui border-2 p-6",
            result.passed ? "border-sage bg-sage-soft" : "border-signal bg-signal-soft",
          )}
        >
          <h2 ref={heading} tabIndex={-1} className="text-h2 focus:outline-none">
            {result.passed ? "Module validé" : "Module pas encore validé"}
          </h2>
          <p className="mt-2 text-lead">
            Votre score{" "}:{" "}
            <strong>
              {result.score}
              {" "}%
            </strong>{" "}
            (il faut {result.passScore}
            {" "}% pour valider).
          </p>
        </div>
        <ol className="flex flex-col gap-4">
          {questions.map((q, i) => {
            const r = byId.get(q.id)!;
            const Icon = r.correct ? CircleCheck : CircleX;
            return (
              <li key={q.id} className="rounded-ui border border-line bg-sheet p-5">
                <p className="mb-2 flex items-start gap-2 font-semibold">
                  <Icon
                    aria-hidden
                    className={cn(
                      "mt-0.5 size-5 shrink-0",
                      r.correct ? "text-sage" : "text-danger",
                    )}
                  />
                  <span>
                    <span className="sr-only">
                      {r.correct ? "Bonne réponse. " : "Réponse incorrecte. "}
                    </span>
                    {i + 1}. {q.prompt}
                  </span>
                </p>
                {!r.correct && (
                  <p className="text-small">
                    Votre réponse{" "}: {q.choices[r.chosen] ?? "aucune"}. Bonne réponse{" "}:{" "}
                    <strong>{q.choices[r.correctIndex]}</strong>.
                  </p>
                )}
                <p className="mt-2 text-muted">{r.explanation}</p>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap gap-4">
          {result.passed ? (
            <ButtonLink href={nextHref}>{nextLabel}</ButtonLink>
          ) : (
            <Button onClick={() => setDismissed(result)}>Recommencer le quiz</Button>
          )}
          {result.passed && (
            <Button variant="secondary" onClick={() => setDismissed(result)}>
              Refaire le quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="count" value={questions.length} />
      <p className="text-muted">
        {questions.length} questions. Il faut {passScore}
        {" "}% de bonnes réponses pour valider le module ; vous pouvez recommencer autant de fois
        que nécessaire.
      </p>
      {result.status === "error" && (
        <p role="alert" className="font-semibold text-danger">
          {result.message}
        </p>
      )}
      {questions.map((q, i) => (
        <fieldset
          key={q.id}
          className="flex flex-col gap-3 rounded-ui border border-line bg-sheet p-5"
        >
          <legend className="px-1 font-semibold">
            <span className="text-muted">
              Question {i + 1} sur {questions.length} ·{" "}
            </span>
            {q.prompt}
          </legend>
          {q.choices.map((c, j) => (
            <label
              key={c}
              className="flex min-h-11 items-center gap-3 rounded-ui border border-line px-3 has-[:checked]:border-ink has-[:checked]:bg-ink-soft"
            >
              <input type="radio" name={`q${i}`} value={j} required className="size-5 accent-ink" />
              {c}
            </label>
          ))}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Correction…" : "Valider mes réponses"}
        </Button>
        <Link href={nextHref} className="link text-small">
          Passer le quiz pour l’instant
        </Link>
      </div>
    </form>
  );
}
