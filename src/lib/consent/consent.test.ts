import { describe, expect, it } from "vitest";

import {
  allChoices,
  CONSENT_PURPOSES,
  decide,
  emptyRecord,
  isAllowed,
  needsChoice,
  parseRecord,
  type ConsentPurpose,
} from "./consent";

const purposes: ConsentPurpose[] = [
  { id: "pub", label: "Publicité", description: "Mesurer les campagnes.", vendors: ["X"] },
  { id: "video", label: "Vidéos tierces", description: "Lire des vidéos.", vendors: ["Y"] },
];
const ID = "8f0c7a44-3a6b-4c5d-9e2f-1a2b3c4d5e6f";
const now = new Date("2026-09-29T12:00:00Z");

describe("consent", () => {
  it("v1 sets no tracker requiring consent, so nobody is asked", () => {
    expect(CONSENT_PURPOSES).toEqual([]);
    expect(needsChoice(null, CONSENT_PURPOSES, "v1", 6, now)).toBe(false);
  });

  it("asks when a purpose exists and no current choice was made", () => {
    expect(needsChoice(null, purposes, "v1", 6, now)).toBe(true);
    expect(needsChoice(emptyRecord(ID), purposes, "v1", 6, now)).toBe(true);
    const decided = decide(emptyRecord(ID), { pub: true }, purposes, "v1", now);
    expect(needsChoice(decided, purposes, "v1", 6, now)).toBe(false);
    expect(needsChoice(decided, purposes, "v2", 6, now), "new purposes list").toBe(true);
    expect(
      needsChoice(decided, purposes, "v1", 6, new Date("2027-03-29T12:00:00Z")),
      "after 6 months",
    ).toBe(true);
  });

  it("allows a purpose only by explicit, valid choice", () => {
    const decided = decide(emptyRecord(ID), { pub: true, inconnu: true }, purposes, "v1", now);
    expect(decided.choices).toEqual({ pub: true, video: false });
    expect(isAllowed(decided, "pub", purposes, "v1", 6, now)).toBe(true);
    expect(isAllowed(decided, "video", purposes, "v1", 6, now)).toBe(false);
    expect(isAllowed(null, "pub", purposes, "v1", 6, now)).toBe(false);
    expect(isAllowed(decided, "pub", purposes, "v2", 6, now)).toBe(false);
  });

  it("accept all and reject all cover every purpose", () => {
    expect(allChoices(purposes, true)).toEqual({ pub: true, video: true });
    expect(allChoices(purposes, false)).toEqual({ pub: false, video: false });
  });

  it("parses stored records defensively", () => {
    const record = decide(emptyRecord(ID), {}, purposes, "v1", now);
    expect(parseRecord(JSON.stringify(record))).toEqual(record);
    expect(parseRecord(null)).toBeNull();
    expect(parseRecord("{pas du json")).toBeNull();
    expect(parseRecord(JSON.stringify({ visitorId: "x" }))).toBeNull();
  });
});
