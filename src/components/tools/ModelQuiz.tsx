"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { stepHref } from "@/data/parcours";
import { models, quizQuestions } from "@/data/quiz-modele";
import { isComplete, rankModels, type QuizAnswers } from "@/lib/calc/quiz";

/** Tool 4 — orientation quiz. `guide` is passed only when the guide is published. */
export function ModelQuiz({ guide }: { guide: { title: string; href: Route } | null }) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [attempted, setAttempted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const missing = quizQuestions.filter((q) => !answers[q.id]);
  const complete = isComplete(answers);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (complete) {
      setShowResult(true);
      requestAnimationFrame(() => resultHeading.current?.focus());
    } else document.getElementById(`q-${missing[0].id}`)?.focus();
  }

  function restart() {
    setAnswers({});
    setAttempted(false);
    setShowResult(false);
    requestAnimationFrame(() => document.getElementById(`q-${quizQuestions[0].id}`)?.focus());
  }

  if (showResult && complete) {
    const [first, second] = rankModels(answers).map((id) => models[id]);
    return (
      <section aria-labelledby="resultat-title" className="flex max-w-3xl flex-col gap-6">
        <div className="rounded-ui border-2 border-sage bg-sheet p-6">
          <p className="mb-1 text-small font-semibold text-sage">
            Le modèle qui vous correspond le mieux
          </p>
          <h2
            id="resultat-title"
            ref={resultHeading}
            tabIndex={-1}
            className="mb-2 text-h2 focus:outline-none"
          >
            {first.title}
          </h2>
          <p className="mb-5 text-lead">{first.summary}</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-sans text-ui font-semibold text-text">Avantages</h3>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {first.advantages.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-sans text-ui font-semibold text-text">Risques</h3>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {first.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p>
          <span className="font-semibold">Autre piste à considérer{" "}:</span>{" "}
          {second.title.toLowerCase()}. {second.summary}
        </p>
        <Callout type="info" title="Une orientation, pas une promesse">
          <p>
            Ce résultat dépend uniquement de vos réponses. Il ne dit rien de vos futurs revenus :
            testez votre idée à petit budget avant d’investir.
          </p>
        </Callout>
        <div className="flex flex-wrap items-center gap-4">
          {guide ? (
            <ButtonLink href={guide.href}>Lire le guide des 6 modèles</ButtonLink>
          ) : (
            <ButtonLink href={stepHref("trouver-son-idee")}>
              Continuer l’étape 1 du parcours
            </ButtonLink>
          )}
          <Button variant="secondary" onClick={restart}>
            Refaire le quiz
          </Button>
        </div>
        {guide && (
          <p className="text-small text-muted">
            Guide conseillé{" "}:{" "}
            <Link href={guide.href} className="link">
              {guide.title}
            </Link>
          </p>
        )}
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-3xl flex-col gap-8" noValidate>
      <p className="text-muted">
        {quizQuestions.length} questions, environ deux minutes. Aucune donnée n’est enregistrée.
      </p>
      {quizQuestions.map((q, i) => {
        const error = attempted && !answers[q.id];
        return (
          <fieldset
            key={q.id}
            id={`q-${q.id}`}
            tabIndex={-1}
            aria-describedby={error ? `q-${q.id}-error` : undefined}
            className="flex flex-col gap-3 rounded-ui border border-line bg-sheet p-5 focus:outline-none"
          >
            <legend className="px-1 font-semibold">
              <span className="text-muted">
                Question {i + 1} sur {quizQuestions.length} ·{" "}
              </span>
              {q.text}
            </legend>
            {error && (
              <p id={`q-${q.id}-error`} className="text-small font-semibold text-danger">
                Choisissez une réponse pour continuer.
              </p>
            )}
            {q.options.map((o) => (
              <label
                key={o.id}
                className="flex min-h-11 items-center gap-3 rounded-ui border border-line px-3 has-[:checked]:border-ink has-[:checked]:bg-ink-soft"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={o.id}
                  checked={answers[q.id] === o.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                  className="size-5 accent-ink"
                />
                {o.label}
              </label>
            ))}
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Voir ma recommandation
        </Button>
        <p className="text-small text-muted" aria-live="polite">
          {missing.length === 0
            ? "Toutes les questions ont une réponse."
            : `${quizQuestions.length - missing.length} réponse${quizQuestions.length - missing.length > 1 ? "s" : ""} sur ${quizQuestions.length}`}
        </p>
      </div>
    </form>
  );
}
