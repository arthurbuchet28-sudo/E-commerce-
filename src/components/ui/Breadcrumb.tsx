import type { Route } from "next";
import Link from "next/link";

export type Crumb = { label: string; href?: Route };

/** Last crumb is the current page (no link). JSON-LD BreadcrumbList is added in the SEO phase. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-small">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="link">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-text" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
