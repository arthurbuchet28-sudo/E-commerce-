import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/** Native <details>: keyboard and screen-reader support for free, works without JS. */
export function Accordion({ items }: { items: Array<{ title: string; content: ReactNode }> }) {
  return (
    <div className="divide-y divide-line rounded-ui border border-line bg-sheet">
      {items.map((item) => (
        <details key={item.title} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {item.title}
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
