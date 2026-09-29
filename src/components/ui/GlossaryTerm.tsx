"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type GlossaryTermProps = { children: ReactNode; definition: string; href: Route };

/**
 * Glossary tooltip. WCAG 1.4.13: shown on hover AND focus, hoverable, dismissable with
 * Escape, persistent until the pointer/focus leaves. The term stays a real link to the
 * glossary entry, so it works without JS.
 */
export function GlossaryTerm({ children, definition, href }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span
      ref={wrapper}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href={href}
        aria-describedby={id}
        className="underline decoration-ink decoration-dotted decoration-2 underline-offset-4"
      >
        {children}
      </Link>
      <span
        id={id}
        role="tooltip"
        className={
          open
            ? "absolute top-full left-0 z-20 mt-2 w-72 max-w-[80vw] rounded-ui border border-ink bg-sheet p-3 font-sans text-small text-text shadow-none"
            : "sr-only"
        }
      >
        {definition}
      </span>
    </span>
  );
}
