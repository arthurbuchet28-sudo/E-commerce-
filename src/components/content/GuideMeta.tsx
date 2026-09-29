import { LevelBadge } from "@/components/ui/LevelBadge";
import { formatDate } from "@/components/mdx/components";

type GuideMetaProps = {
  updatedAt: string;
  readingMinutes: number;
  level: "debutant" | "intermediaire";
  author: string;
  draft: boolean;
};

export function GuideMeta({ updatedAt, readingMinutes, level, author, draft }: GuideMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-muted">
      <span>
        Mis à jour le <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
      </span>
      <span>{readingMinutes} min de lecture</span>
      <span>Par {author}</span>
      <LevelBadge level={level} />
      {draft && (
        <span className="rounded-full border border-signal bg-signal-soft px-2.5 py-0.5 font-semibold text-text">
          Brouillon, non publié
        </span>
      )}
    </div>
  );
}

export const LEGAL_NOTICE =
  "Contenu informatif, à jour à la date indiquée. Il ne remplace pas l’avis d’un expert-comptable ou d’un avocat.";
