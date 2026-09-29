export type Level = "debutant" | "intermediaire";

const labels: Record<Level, string> = { debutant: "Débutant", intermediaire: "Intermédiaire" };

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sheet px-2.5 py-0.5 text-small">
      <span aria-hidden className="flex gap-0.5">
        <span className="size-1.5 rounded-full bg-ink" />
        <span
          className={
            level === "intermediaire"
              ? "size-1.5 rounded-full bg-ink"
              : "size-1.5 rounded-full border border-ink"
          }
        />
      </span>
      <span>
        <span className="sr-only">Niveau : </span>
        {labels[level]}
      </span>
    </span>
  );
}
