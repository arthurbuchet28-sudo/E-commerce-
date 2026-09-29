import { describe, expect, it } from "vitest";

import { syncDecision } from "./localSync";

const t1 = "2026-09-29T10:00:00.000Z";
const t2 = "2026-09-29T11:00:00.000Z";

describe("syncDecision", () => {
  it("does nothing when both sides are empty", () => {
    expect(syncDecision({ raw: null, updatedAt: null }, null)).toBe("none");
  });
  it("pushes local progress to an empty account", () => {
    expect(syncDecision({ raw: "{}", updatedAt: t1 }, null)).toBe("push");
  });
  it("pulls the account into an empty browser", () => {
    expect(syncDecision({ raw: null, updatedAt: null }, { data: {}, clientUpdatedAt: t1 })).toBe(
      "pull",
    );
    expect(syncDecision({ raw: "{}", updatedAt: null }, { data: {}, clientUpdatedAt: t1 })).toBe(
      "pull",
    );
  });
  it("keeps the most recent side", () => {
    expect(syncDecision({ raw: "{}", updatedAt: t2 }, { data: {}, clientUpdatedAt: t1 })).toBe(
      "push",
    );
    expect(syncDecision({ raw: "{}", updatedAt: t1 }, { data: {}, clientUpdatedAt: t2 })).toBe(
      "pull",
    );
    expect(syncDecision({ raw: "{}", updatedAt: t1 }, { data: {}, clientUpdatedAt: t1 })).toBe(
      "none",
    );
  });
});
