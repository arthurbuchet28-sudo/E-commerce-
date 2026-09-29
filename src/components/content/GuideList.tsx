import { GuideCard } from "@/components/ui/Cards";
import type { Guide } from "@/lib/content/guides";

export function GuideList({ guides, empty }: { guides: Guide[]; empty?: string }) {
  if (guides.length === 0) {
    return (
      <p className="rounded-ui border border-dashed border-border bg-sheet p-5 text-muted">
        {empty ?? "Aucun guide pour l’instant."}
      </p>
    );
  }
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {guides.map((g) => (
        <li key={g.href} className="flex">
          <GuideCard
            href={g.href}
            title={g.title}
            description={g.description}
            category={g.categoryInfo.title}
            readingMinutes={g.readingMinutes}
            level={g.level}
          />
        </li>
      ))}
    </ul>
  );
}
