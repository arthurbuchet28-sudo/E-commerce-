import { describe, expect, it } from "vitest";

import {
  courseProgress,
  courseSequence,
  formatDuration,
  formatPrice,
  parseQuizSlug,
  quizSlug,
} from "./progress";

const modules = [
  { id: "m1", position: 1, title: "Un", hasQuiz: true },
  { id: "m2", position: 2, title: "Deux", hasQuiz: true },
];
const lessons = [
  { id: "l1", slug: "a", moduleId: "m1", title: "A" },
  { id: "l2", slug: "b", moduleId: "m1", title: "B" },
  { id: "l3", slug: "c", moduleId: "m2", title: "C" },
];

describe("course progress", () => {
  it("starts at the first lesson", () => {
    const p = courseProgress(modules, lessons, new Set(), new Set());
    expect(p).toMatchObject({
      percent: 0,
      complete: false,
      resumeSlug: "a",
      totalLessons: 3,
      totalQuizzes: 2,
    });
  });

  it("sends to the module quiz once its lessons are done", () => {
    const p = courseProgress(modules, lessons, new Set(["l1", "l2"]), new Set());
    expect(p.resumeSlug).toBe("quiz-module-1");
    expect(p.percent).toBe(40);
  });

  it("continues with the next lesson after a passed quiz", () => {
    expect(
      courseProgress(modules, lessons, new Set(["l1", "l2"]), new Set(["m1"])).resumeSlug,
    ).toBe("c");
  });

  it("is complete when every lesson and quiz is done, resuming at the last seen lesson", () => {
    const p = courseProgress(
      modules,
      lessons,
      new Set(["l1", "l2", "l3"]),
      new Set(["m1", "m2"]),
      "l2",
    );
    expect(p).toMatchObject({ percent: 100, complete: true, resumeSlug: "b" });
    expect(
      courseProgress(modules, lessons, new Set(["l1", "l2", "l3"]), new Set(["m1", "m2"]))
        .resumeSlug,
    ).toBe("a");
  });

  it("handles an empty course", () => {
    expect(courseProgress([], [], new Set(), new Set())).toMatchObject({
      percent: 0,
      complete: false,
      resumeSlug: null,
    });
  });

  it("orders lessons and quizzes", () => {
    expect(courseSequence(modules, lessons).map((s) => s.slug)).toEqual([
      "a",
      "b",
      "quiz-module-1",
      "c",
      "quiz-module-2",
    ]);
    expect(
      courseSequence([{ ...modules[0], hasQuiz: false }], lessons.slice(0, 1)).map((s) => s.kind),
    ).toEqual(["lesson"]);
  });

  it("parses quiz slugs", () => {
    expect(quizSlug(2)).toBe("quiz-module-2");
    expect(parseQuizSlug("quiz-module-12")).toBe(12);
    expect(parseQuizSlug("panorama")).toBeNull();
  });

  it("formats durations and prices", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(90)).toBe("1 h 30");
    expect(formatDuration(125)).toBe("2 h 05");
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(4900)).toBe("49 € TTC");
    expect(formatPrice(4950)).toBe("49,50 € TTC");
  });
});
