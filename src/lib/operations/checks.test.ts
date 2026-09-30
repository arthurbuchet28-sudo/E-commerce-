import { describe, expect, it } from "vitest";

import { evaluateStatus, overallState, type StatusInput } from "./checks";

const now = new Date("2026-10-01T12:00:00Z");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);
const production: StatusInput = {
  database: "ok",
  payments: "stripe",
  email: "brevo",
  video: "bunny",
  monitoring: true,
  dailyJob: { lastRunAt: hoursAgo(5), ok: true },
  now,
};
const state = (input: StatusInput, id: string) =>
  evaluateStatus(input).find((c) => c.id === id)?.state;

describe("status checks", () => {
  it("is fully operational with every service configured and a recent daily job", () => {
    const checks = evaluateStatus(production);
    expect(checks.every((c) => c.state === "ok")).toBe(true);
    expect(overallState(checks)).toBe("ok");
    expect(checks.find((c) => c.id === "tache-quotidienne")?.detail).toBe(
      "Dernière exécution il y a 5 h",
    );
  });

  it("is down when the database does not answer", () => {
    const checks = evaluateStatus({ ...production, database: "down" });
    expect(overallState(checks)).toBe("down");
    expect(checks.find((c) => c.id === "base")?.detail).toBe("Indisponible");
  });

  it("flags a late, failed or missing daily job as degraded", () => {
    const late = evaluateStatus({ ...production, dailyJob: { lastRunAt: hoursAgo(30), ok: true } });
    expect(overallState(late)).toBe("degraded");
    expect(
      state(
        { ...production, dailyJob: { lastRunAt: hoursAgo(0.5), ok: false } },
        "tache-quotidienne",
      ),
    ).toBe("degraded");
    expect(
      evaluateStatus({ ...production, dailyJob: { lastRunAt: hoursAgo(0.5), ok: false } }).find(
        (c) => c.id === "tache-quotidienne",
      )?.detail,
    ).toBe("En échec (il y a moins d’une heure)");
    expect(state({ ...production, dailyJob: null }, "tache-quotidienne")).toBe("degraded");
  });

  it("shows simulated services locally without raising an incident", () => {
    const local: StatusInput = {
      ...production,
      database: "not_configured",
      payments: "simulated",
      email: "local",
      video: "mock",
      monitoring: false,
    };
    const checks = evaluateStatus(local);
    expect(checks.filter((c) => c.state === "simulated").map((c) => c.id)).toEqual([
      "base",
      "paiements",
      "emails",
      "videos",
      "surveillance",
    ]);
    expect(overallState(checks)).toBe("ok");
  });
});
