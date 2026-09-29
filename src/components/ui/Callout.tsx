import { Info, Lightbulb, Scale, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "./cn";

export type CalloutType = "info" | "attention" | "legal" | "astuce";

const styles: Record<CalloutType, { label: string; icon: LucideIcon; box: string; icon_: string }> =
  {
    info: { label: "Bon à savoir", icon: Info, box: "bg-ink-soft border-ink", icon_: "text-ink" },
    attention: {
      label: "Attention",
      icon: TriangleAlert,
      box: "bg-signal-soft border-signal",
      icon_: "text-text",
    },
    legal: {
      label: "Point juridique",
      icon: Scale,
      box: "bg-sheet border-signal",
      icon_: "text-text",
    },
    astuce: {
      label: "Astuce",
      icon: Lightbulb,
      box: "bg-sage-soft border-sage",
      icon_: "text-sage",
    },
  };

type CalloutProps = { type?: CalloutType; title?: ReactNode; children: ReactNode };

/** « Encadré » for guides and lessons. The type is conveyed by text, not colour alone. */
export function Callout({ type = "info", title, children }: CalloutProps) {
  const s = styles[type];
  const Icon = s.icon;
  return (
    <aside
      className={cn(
        "not-prose rounded-ui border border-l-[6px] border-y-line border-r-line p-4 font-sans text-ui",
        s.box,
      )}
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icon aria-hidden className={cn("size-5 shrink-0", s.icon_)} />
        {title ?? s.label}
      </p>
      <div className="[&_a]:link mt-2 space-y-2">{children}</div>
    </aside>
  );
}
