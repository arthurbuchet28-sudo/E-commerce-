import Link from "next/link";

import { siteConfig } from "@/config/site";

/** Wordmark with a small itinerary glyph (two milestones on a line). */
export function Logo() {
  return (
    <Link
      href="/"
      className="flex min-h-11 items-center gap-2 font-serif text-xl font-semibold text-ink"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none">
        <path d="M12 6v12" stroke="var(--sage)" strokeWidth="3" />
        <circle cx="12" cy="5" r="3.5" fill="var(--sage)" />
        <circle cx="12" cy="19" r="3" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="2.5" />
      </svg>
      {siteConfig.name}
      <span className="sr-only">, accueil</span>
    </Link>
  );
}
