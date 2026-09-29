import type { Route } from "next";
import type { ReactNode } from "react";

import { Breadcrumb, type Crumb } from "@/components/ui/Breadcrumb";
import { findRoute } from "@/config/routes";

/** Builds breadcrumbs from the URL, using registry labels for known parent paths. */
export function breadcrumbFor(path: string, currentLabel: string, extra: Crumb[] = []): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Accueil", href: "/" }];
  const segments = path.split("/").filter(Boolean);
  for (let i = 1; i < segments.length; i++) {
    const parent = `/${segments.slice(0, i).join("/")}`;
    const entry = findRoute(parent);
    if (entry) crumbs.push({ label: entry.label, href: entry.path as Route });
  }
  return [...crumbs, ...extra, { label: currentLabel }];
}

type PageHeaderProps = { title: string; lead?: ReactNode; crumbs: Crumb[] };

export function PageHeader({ title, lead, crumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pt-6 pb-8">
      <Breadcrumb items={crumbs} />
      <h1 className="text-h1">{title}</h1>
      {lead && <p className="max-w-prose text-lead text-muted">{lead}</p>}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className ?? ""}`}>{children}</div>
  );
}
