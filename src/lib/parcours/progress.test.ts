import { describe, expect, it } from "vitest";

import { parcoursSteps } from "@/data/parcours";

import {
  normalizeProgress,
  overallProgress,
  parseProgress,
  stepsProgress,
  toggleItem,
} from "./progress";

const steps = [
  { slug: "a", size: 2 },
  { slug: "b", size: 3 },
  { slug: "c", size: 1 },
];

describe("parcours progress", () => {
  it("starts empty with the first step current", () => {
    const p = parseProgress(null, steps);
    expect(p).toEqual({ a: [false, false], b: [false, false, false], c: [false] });
    expect(stepsProgress(p, steps).map((s) => s.status)).toEqual(["current", "todo", "todo"]);
    expect(overallProgress(p, steps)).toEqual({ checked: 0, total: 6, percent: 0, stepsDone: 0 });
  });

  it("marks completed steps done and the first incomplete one current", () => {
    const p = normalizeProgress({ a: [true, true], b: [true, false, false], c: [true] }, steps);
    expect(stepsProgress(p, steps).map((s) => s.status)).toEqual(["done", "current", "done"]);
    expect(overallProgress(p, steps)).toEqual({ checked: 4, total: 6, percent: 67, stepsDone: 2 });
  });

  it("tolerates corrupted, stale or unknown data", () => {
    expect(parseProgress("{not json", steps).a).toEqual([false, false]);
    const p = normalizeProgress({ a: [true, "yes", true, true], zzz: [true], b: "x" }, steps);
    expect(p).toEqual({ a: [true, false], b: [false, false, false], c: [false] });
    expect(normalizeProgress([1, 2], steps).a).toEqual([false, false]);
  });

  it("toggles one item without mutating the input", () => {
    const p = parseProgress(null, steps);
    const next = toggleItem(p, "b", 1);
    expect(next.b).toEqual([false, true, false]);
    expect(p.b).toEqual([false, false, false]);
    expect(toggleItem(next, "b", 1).b).toEqual([false, false, false]);
  });

  it("has a checklist for each of the 8 real steps", () => {
    expect(parcoursSteps).toHaveLength(8);
    for (const s of parcoursSteps) {
      expect(s.checklist.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.deliverables.length, s.slug).toBeGreaterThanOrEqual(1);
    }
  });
});
