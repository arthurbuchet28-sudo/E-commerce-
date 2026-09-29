// @vitest-environment node
import { createHash } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { bunnyToken, bunnyVideoProvider, mockVideoProvider } from "./video";

describe("video providers", () => {
  it("mock provider never returns a URL", () => {
    expect(mockVideoProvider.playback("abc")).toBeNull();
  });

  it("signs Bunny embed URLs with an expiry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
    const p = bunnyVideoProvider("123", "secret", 600).playback("vid-1")!;
    const expires = Math.floor(Date.parse("2026-09-29T12:00:00Z") / 1000) + 600;
    expect(p.expiresAt).toBe(expires);
    const url = new URL(p.src);
    expect(url.pathname).toBe("/embed/123/vid-1");
    expect(url.searchParams.get("token")).toBe(
      createHash("sha256").update(`secretvid-1${expires}`).digest("hex"),
    );
    expect(url.searchParams.get("autoplay")).toBe("false");
    vi.useRealTimers();
  });

  it("returns nothing when the lesson has no video yet", () => {
    expect(bunnyVideoProvider("1", "k").playback(null)).toBeNull();
  });

  it("produces a hex SHA-256 token", () => {
    expect(bunnyToken("k", "v", 1)).toMatch(/^[0-9a-f]{64}$/);
  });
});
