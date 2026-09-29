import type { Route } from "next";
import Link from "next/link";

import { cn } from "./cn";

type PaginationProps = { current: number; total: number; hrefFor: (page: number) => Route };

export function Pagination({ current, total, hrefFor }: PaginationProps) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const item = "flex min-h-11 min-w-11 items-center justify-center rounded-ui border px-3";
  return (
    <nav aria-label="Pagination">
      <ul className="flex flex-wrap items-center gap-2">
        {current > 1 && (
          <li>
            <Link href={hrefFor(current - 1)} className={cn(item, "link border-line bg-sheet")}>
              Page précédente
            </Link>
          </li>
        )}
        {pages.map((p) => (
          <li key={p}>
            {p === current ? (
              <span
                aria-current="page"
                className={cn(item, "border-ink bg-ink font-semibold text-on-ink")}
              >
                <span className="sr-only">Page </span>
                {p}
              </span>
            ) : (
              <Link
                href={hrefFor(p)}
                className={cn(item, "border-line bg-sheet text-ink hover:border-ink")}
              >
                <span className="sr-only">Page </span>
                {p}
              </Link>
            )}
          </li>
        ))}
        {current < total && (
          <li>
            <Link href={hrefFor(current + 1)} className={cn(item, "link border-line bg-sheet")}>
              Page suivante
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
