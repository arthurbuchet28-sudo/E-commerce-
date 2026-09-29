import { Check, ListChecks } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/components/ui/cn";
import type { CourseDetail } from "@/lib/lms/queries";
import { quizSlug } from "@/lib/lms/progress";

/** Course outline (sidebar): lessons and quizzes, completion state, current item. */
export function CourseOutline({
  course,
  current,
  completed,
  passed,
  canLearn,
}: {
  course: CourseDetail;
  current: string;
  completed: ReadonlySet<string>;
  passed: ReadonlySet<string>;
  canLearn: boolean;
}) {
  return (
    <nav aria-label="Sommaire de la formation">
      <ol className="flex flex-col gap-5">
        {course.modules.map((m) => (
          <li key={m.id}>
            <p className="mb-2 text-small font-semibold text-muted">
              Module {m.position} · {m.title}
            </p>
            <ol className="flex flex-col gap-1">
              {m.lessons.map((l) => {
                const done = completed.has(l.id);
                const reachable = canLearn || l.isPreview;
                return (
                  <li key={l.id}>
                    <OutlineItem
                      href={reachable ? (`/apprendre/${course.slug}/${l.slug}` as Route) : null}
                      label={l.title}
                      done={done}
                      current={current === l.slug}
                    />
                  </li>
                );
              })}
              {m.hasQuiz && (
                <li>
                  <OutlineItem
                    href={
                      canLearn
                        ? (`/apprendre/${course.slug}/${quizSlug(m.position)}` as Route)
                        : null
                    }
                    label="Quiz du module"
                    done={passed.has(m.id)}
                    current={current === quizSlug(m.position)}
                    quiz
                  />
                </li>
              )}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function OutlineItem({
  href,
  label,
  done,
  current,
  quiz,
}: {
  href: Route | null;
  label: string;
  done: boolean;
  current: boolean;
  quiz?: boolean;
}) {
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          done ? "border-sage bg-sage text-on-ink" : current ? "border-ink" : "border-border",
        )}
      >
        {done ? (
          <Check className="size-3" strokeWidth={3} />
        ) : quiz ? (
          <ListChecks className="size-3" />
        ) : null}
      </span>
      <span>
        {label}
        <span className="sr-only">{done ? " (terminé)" : ""}</span>
      </span>
    </>
  );
  const cls = cn(
    "flex items-start gap-2 rounded-ui px-2 py-1.5 text-small",
    current && "bg-ink-soft font-semibold",
  );
  if (!href) return <span className={cn(cls, "text-muted")}>{content}</span>;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(cls, "hover:bg-ink-soft")}
    >
      {content}
    </Link>
  );
}
