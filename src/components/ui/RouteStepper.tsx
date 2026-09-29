import type { Route } from "next";
import Link from "next/link";

import { cn } from "./cn";

export type RouteStep = { title: string; href?: Route; status: "done" | "current" | "todo" };

const statusLabel = { done: "terminée", current: "en cours", todo: "à faire" } as const;

/**
 * « Ligne d'itinéraire » — the signature element. A continuous vertical line with milestones;
 * the travelled part turns sage. The fill animation is the only orchestrated animation of the
 * site (disabled by prefers-reduced-motion in globals.css).
 */
export function RouteStepper({ steps, label }: { steps: RouteStep[]; label: string }) {
  let doneIndex = 0;
  return (
    <nav aria-label={label}>
      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          // The segment leaving a completed step is "travelled".
          const travelled = step.status === "done";
          const delay = travelled ? doneIndex++ * 180 : 0;
          return (
            <li key={step.title} className={cn("relative flex items-start gap-4", !last && "pb-5")}>
              {!last && (
                <>
                  <span
                    aria-hidden
                    className="absolute top-[25px] bottom-0 left-[11px] w-[3px] bg-line"
                  />
                  {travelled && (
                    <span
                      aria-hidden
                      className="route-fill absolute top-[25px] bottom-0 left-[11px] w-[3px] bg-sage"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  )}
                </>
              )}
              <span
                aria-hidden
                className={cn(
                  "relative z-10 flex size-[25px] shrink-0 items-center justify-center rounded-full border-[3px] text-[0.7rem] font-bold",
                  step.status === "done" && "border-sage bg-sage text-on-ink",
                  step.status === "current" && "border-ink bg-sheet text-ink",
                  step.status === "todo" && "border-border bg-paper text-muted",
                )}
              >
                {i + 1}
              </span>
              <span className="flex flex-col">
                {step.href ? (
                  <Link
                    href={step.href}
                    aria-current={step.status === "current" ? "step" : undefined}
                    className={cn("link", step.status === "current" && "font-semibold")}
                  >
                    {step.title}
                  </Link>
                ) : (
                  <span className={cn(step.status === "current" && "font-semibold")}>
                    {step.title}
                  </span>
                )}
                <span className="text-small text-muted">
                  Étape {i + 1} · {statusLabel[step.status]}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
