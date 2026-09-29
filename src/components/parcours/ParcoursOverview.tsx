"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { RouteStepper } from "@/components/ui/RouteStepper";
import { parcoursSteps, stepHref } from "@/data/parcours";
import { useParcoursProgress } from "@/lib/parcours/useParcoursProgress";

/** The itinerary line with the visitor's saved progress. */
export function ParcoursOverview({ label, showBar = true }: { label: string; showBar?: boolean }) {
  const { steps, overall } = useParcoursProgress();
  return (
    <div className="flex flex-col gap-6">
      {showBar && (
        <ProgressBar
          value={overall.checked}
          max={overall.total}
          label={`Votre progression : ${overall.stepsDone} étape${overall.stepsDone > 1 ? "s" : ""} sur ${parcoursSteps.length}`}
        />
      )}
      <RouteStepper
        label={label}
        steps={parcoursSteps.map((s, i) => ({
          title: s.title,
          href: stepHref(s.slug),
          status: steps[i].status,
          detail:
            steps[i].checked > 0 && steps[i].status !== "done"
              ? `${steps[i].checked} point${steps[i].checked > 1 ? "s" : ""} sur ${steps[i].total}`
              : undefined,
        }))}
      />
    </div>
  );
}
