"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/ui/cn";

const items: Array<{ href: Route; label: string }> = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/formations", label: "Formations" },
  { href: "/admin/eleves", label: "Élèves" },
  { href: "/admin/achats", label: "Achats" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="mb-8 border-b border-line">
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {items.map((i) => {
          const current = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-block border-b-2 pb-2 font-semibold",
                  current ? "border-ink text-ink" : "border-transparent text-muted hover:text-text",
                )}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
