import { CircleAlert, CircleCheck } from "lucide-react";

import type { FormState } from "@/app/compte/actions";
import { cn } from "@/components/ui/cn";

/** Result message of a form: announced to screen readers, never color-only. */
export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <div
      role={ok ? "status" : "alert"}
      className={cn(
        "flex items-start gap-3 rounded-ui border border-l-[6px] p-4",
        ok ? "border-sage bg-sage-soft" : "border-danger bg-danger-soft",
      )}
    >
      <Icon
        aria-hidden
        className={cn("mt-0.5 size-5 shrink-0", ok ? "text-sage" : "text-danger")}
      />
      <p>{state.message}</p>
    </div>
  );
}
