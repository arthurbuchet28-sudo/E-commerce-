import type { Route } from "next";
import Link from "next/link";

import { LevelBadge, type Level } from "./LevelBadge";
import { NoBreakHyphens } from "./NoBreakHyphens";

type GuideCardProps = {
  href: Route;
  title: string;
  description: string;
  category: string;
  readingMinutes: number;
  level: Level;
};

/** Whole card is clickable through the title link (stretched link), keeping one tab stop. */
export function GuideCard({
  href,
  title,
  description,
  category,
  readingMinutes,
  level,
}: GuideCardProps) {
  return (
    <article className="group relative flex w-full flex-col gap-3 rounded-ui border border-line bg-sheet p-5 hover:border-ink">
      <p className="text-small text-muted">{category}</p>
      <h3 className="text-h3">
        <Link href={href} className="group-hover:underline after:absolute after:inset-0">
          <NoBreakHyphens text={title} />
        </Link>
      </h3>
      <p className="text-muted">{description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-3 text-small text-muted">
        <span>{readingMinutes} min de lecture</span>
        <LevelBadge level={level} />
      </div>
    </article>
  );
}

type CourseCardProps = {
  href: Route;
  title: string;
  summary: string;
  lessons: number;
  duration: string;
  /** Formatted price, e.g. "49 € TTC", or null for a free course. */
  price: string | null;
  progress?: number;
};

export function CourseCard({
  href,
  title,
  summary,
  lessons,
  duration,
  price,
  progress,
}: CourseCardProps) {
  return (
    <article className="group relative flex w-full flex-col gap-3 rounded-ui border border-line bg-sheet p-5 hover:border-ink">
      <h3 className="text-h3">
        <Link href={href} className="group-hover:underline after:absolute after:inset-0">
          <NoBreakHyphens text={title} />
        </Link>
      </h3>
      <p className="text-muted">{summary}</p>
      <dl className="mt-auto grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-small">
        <dt className="text-muted">Leçons</dt>
        <dd>{lessons}</dd>
        <dt className="text-muted">Durée</dt>
        <dd>{duration}</dd>
        <dt className="text-muted">Prix</dt>
        <dd className="font-semibold">{price ?? "Gratuite (avec un compte)"}</dd>
      </dl>
      {progress !== undefined && (
        <p className="text-small font-semibold text-sage">{Math.round(progress)} % terminé</p>
      )}
    </article>
  );
}
