"use client";

import Link from "next/link";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { parcoursSteps, stepHref } from "@/data/parcours";
import { useParcoursProgress } from "@/lib/parcours/useParcoursProgress";

export function ParcoursSummary() {
  const { overall, steps } = useParcoursProgress();
  const next = parcoursSteps[steps.findIndex((s) => s.status === "current")];
  return (
    <div className="flex flex-col gap-4">
      <ProgressBar
        value={overall.checked}
        max={overall.total}
        label={`${overall.stepsDone} étape${overall.stepsDone > 1 ? "s" : ""} terminée${overall.stepsDone > 1 ? "s" : ""} sur ${parcoursSteps.length}`}
      />
      {next ? (
        <p>
          Prochaine étape{" "}:{" "}
          <Link href={stepHref(next.slug)} className="link font-semibold">
            {next.title}
          </Link>
        </p>
      ) : (
        <p className="font-semibold text-sage">Vous avez terminé le parcours. Bravo.</p>
      )}
    </div>
  );
}
