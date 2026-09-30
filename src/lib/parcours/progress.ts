/**
 * Pure progress logic for the « Se lancer » path, independent from storage
 * (localStorage now, the member account from phase 7).
 */

/** A step as the progress logic sees it: its slug and the number of checklist items. */
export type StepDefinition = { slug: string; size: number };

/** Checked items per step slug, by checklist index. */
export type ParcoursProgress = Record<string, boolean[]>;

export type StepStatus = "done" | "current" | "todo";

export type StepProgress = { slug: string; checked: number; total: number; status: StepStatus };

/** Keeps only known steps and aligns each list on the checklist length (tolerates stale data). */
export function normalizeProgress(
  raw: unknown,
  steps: readonly StepDefinition[],
): ParcoursProgress {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return Object.fromEntries(
    steps.map((s) => {
      const saved = Array.isArray(source[s.slug]) ? (source[s.slug] as unknown[]) : [];
      return [s.slug, Array.from({ length: s.size }, (_, i) => saved[i] === true)];
    }),
  );
}

export function parseProgress(
  json: string | null,
  steps: readonly StepDefinition[],
): ParcoursProgress {
  try {
    return normalizeProgress(json ? JSON.parse(json) : {}, steps);
  } catch {
    return normalizeProgress({}, steps);
  }
}

/**
 * A step is done when its whole checklist is ticked. The current step is the first one
 * not done: the user can work on any step, but the path suggests an order.
 */
export function stepsProgress(
  progress: ParcoursProgress,
  steps: readonly StepDefinition[],
): StepProgress[] {
  let currentAssigned = false;
  return steps.map((s) => {
    const items = progress[s.slug] ?? [];
    const checked = items.filter(Boolean).length;
    const total = s.size;
    let status: StepStatus = "todo";
    if (total > 0 && checked === total) status = "done";
    else if (!currentAssigned) {
      status = "current";
      currentAssigned = true;
    }
    return { slug: s.slug, checked, total, status };
  });
}

export function overallProgress(progress: ParcoursProgress, steps: readonly StepDefinition[]) {
  const per = stepsProgress(progress, steps);
  const checked = per.reduce((n, s) => n + s.checked, 0);
  const total = per.reduce((n, s) => n + s.total, 0);
  return {
    checked,
    total,
    percent: total === 0 ? 0 : Math.round((checked / total) * 100),
    stepsDone: per.filter((s) => s.status === "done").length,
  };
}

export function toggleItem(
  progress: ParcoursProgress,
  slug: string,
  index: number,
): ParcoursProgress {
  const items = progress[slug] ?? [];
  return { ...progress, [slug]: items.map((v, i) => (i === index ? !v : v)) };
}
