import { describe, expect, it } from "vitest";

import { safeNext } from "./redirect";

describe("safeNext", () => {
  it.each([
    ["/compte", "/compte"],
    ["/outils/checklist-lancement?x=1", "/outils/checklist-lancement?x=1"],
  ])("keeps internal path %s", (input, expected) => expect(safeNext(input)).toBe(expected));

  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "javascript:alert(1)",
    "",
    null,
    42,
  ])("rejects %s", (input) => expect(safeNext(input)).toBe("/compte"));
});
