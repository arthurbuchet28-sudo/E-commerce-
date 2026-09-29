"use client";

import type { Route } from "next";
import { useMemo, useState } from "react";

import { GuideCard } from "@/components/ui/Cards";
import { SelectField } from "@/components/ui/Field";

export type GuideSummary = {
  href: Route;
  title: string;
  description: string;
  category: string;
  categoryTitle: string;
  level: "debutant" | "intermediaire";
  readingMinutes: number;
};

const durations = {
  all: { label: "Toutes les durées", test: () => true },
  short: { label: "Moins de 5 min", test: (m: number) => m < 5 },
  medium: { label: "De 5 à 10 min", test: (m: number) => m >= 5 && m <= 10 },
  long: { label: "Plus de 10 min", test: (m: number) => m > 10 },
} as const;

/** Client-side filters over the (server-rendered) list of guides. */
export function GuidesExplorer({
  guides,
  categories,
}: {
  guides: GuideSummary[];
  categories: Array<{ slug: string; title: string }>;
}) {
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [duration, setDuration] = useState<keyof typeof durations>("all");

  const filtered = useMemo(
    () =>
      guides.filter(
        (g) =>
          (category === "all" || g.category === category) &&
          (level === "all" || g.level === level) &&
          durations[duration].test(g.readingMinutes),
      ),
    [guides, category, level, duration],
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        className="grid gap-4 rounded-ui border border-line bg-sheet p-4 md:grid-cols-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <SelectField
          id="filtre-categorie"
          label="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="filtre-niveau"
          label="Niveau"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="all">Tous les niveaux</option>
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
        </SelectField>
        <SelectField
          id="filtre-duree"
          label="Durée de lecture"
          value={duration}
          onChange={(e) => setDuration(e.target.value as keyof typeof durations)}
        >
          {Object.entries(durations).map(([key, d]) => (
            <option key={key} value={key}>
              {d.label}
            </option>
          ))}
        </SelectField>
      </form>

      <p className="text-small text-muted" aria-live="polite">
        {filtered.length} guide{filtered.length > 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-ui border border-dashed border-border bg-sheet p-5 text-muted">
          Aucun guide ne correspond à ces filtres. Élargissez la durée ou le niveau.
        </p>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <li key={g.href} className="flex">
              <GuideCard
                href={g.href}
                title={g.title}
                description={g.description}
                category={g.categoryTitle}
                readingMinutes={g.readingMinutes}
                level={g.level}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
