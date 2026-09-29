"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { simulationHref } from "@/components/tools/useInitialInputs";

export type SimulationRow = {
  id: string;
  tool: string;
  toolLabel: string;
  toolPath: string;
  title: string;
  createdAt: string;
  inputs: Record<string, string>;
};

export function SimulationList({ rows }: { rows: SimulationRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(row: SimulationRow) {
    setPending(row.id);
    setError(null);
    const res = await fetch(`/api/compte/simulations/${row.id}`, { method: "DELETE" }).catch(
      () => null,
    );
    setPending(null);
    if (!res?.ok) return setError("La suppression a échoué. Réessayez.");
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="text-muted">
        Aucune simulation enregistrée. Depuis le{" "}
        <Link href="/outils/calculateur-prix-marge" className="link">
          calculateur de prix
        </Link>
        , le simulateur micro-entreprise ou le calcul du seuil de rentabilité, cliquez sur
        « Enregistrer ma simulation ».
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="text-small font-semibold text-danger">
        {error}
      </p>
      <ul className="flex flex-col divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold">{row.title}</p>
              <p className="text-small text-muted">
                {row.toolLabel} ·{" "}
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                  new Date(row.createdAt),
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={simulationHref(row.toolPath, row.inputs) as Route} className="link">
                Rouvrir<span className="sr-only"> la simulation « {row.title} »</span>
              </Link>
              <Button variant="quiet" onClick={() => remove(row)} disabled={pending === row.id}>
                Supprimer<span className="sr-only"> la simulation « {row.title} »</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
