"use client";

import Link from "next/link";

import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ParcoursOutline } from "@/data/parcours";
import { useParcoursProgress } from "@/lib/parcours/useParcoursProgress";

export function ParcoursSummary({ outline }: { outline: ParcoursOutline }) {
  const { overall, steps } = useParcoursProgress(outline);
  const next = outline.steps[steps.findIndex((s) => s.status === "current")];
  return (
    <div className="flex flex-col gap-4">
      <ProgressBar
        value={overall.checked}
        max={overall.total}
        label={`${overall.stepsDone} étape${overall.stepsDone > 1 ? "s" : ""} terminée${overall.stepsDone > 1 ? "s" : ""} sur ${outline.steps.length}`}
      />
      {next ? (
        <p>
          Prochaine étape{" "}:{" "}
          <Link href={next.href} className="link font-semibold">
            {next.title}
          </Link>
        </p>
      ) : (
        <p className="font-semibold text-sage">Vous avez terminé le parcours. Bravo.</p>
      )}
    </div>
  );
}
