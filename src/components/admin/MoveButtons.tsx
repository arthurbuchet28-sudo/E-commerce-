import { ArrowDown, ArrowUp } from "lucide-react";

import { moveItem } from "@/app/admin/actions";

/** Up/down reordering (server action, works without JavaScript). */
export function MoveButtons({
  kind,
  id,
  courseId,
  label,
  first,
  last,
}: {
  kind: "module" | "lesson" | "question";
  id: string;
  courseId: string;
  label: string;
  first: boolean;
  last: boolean;
}) {
  const button =
    "inline-flex size-9 items-center justify-center rounded-ui border border-border bg-sheet disabled:opacity-40";
  return (
    <span className="inline-flex gap-1">
      {[
        { dir: -1, Icon: ArrowUp, text: "Monter", disabled: first },
        { dir: 1, Icon: ArrowDown, text: "Descendre", disabled: last },
      ].map(({ dir, Icon, text, disabled }) => (
        <form key={dir} action={moveItem}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="direction" value={dir} />
          <button type="submit" className={button} disabled={disabled}>
            <Icon aria-hidden className="size-4" />
            <span className="sr-only">{`${text}\u00a0: ${label}`}</span>
          </button>
        </form>
      ))}
    </span>
  );
}
