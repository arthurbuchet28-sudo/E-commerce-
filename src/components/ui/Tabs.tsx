"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "./cn";

type Tab = { id: string; label: string; content: ReactNode };

/** WAI-ARIA tabs pattern: arrow keys / Home / End move between tabs (automatic activation). */
export function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const base = useId();

  function onKeyDown(e: KeyboardEvent) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : e.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${tab.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
            className={cn(
              "-mb-px min-h-11 border-b-[3px] px-4 py-2 whitespace-nowrap",
              i === active
                ? "border-ink font-semibold text-ink"
                : "border-transparent text-muted hover:text-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
