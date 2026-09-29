import { describe, expect, it } from "vitest";

import { formatEuro, formatNumber, formatPercent, parseFrNumber, roundCents } from "./format";

describe("parseFrNumber", () => {
  it.each([
    ["12", 12],
    ["12,5", 12.5],
    ["12.5", 12.5],
    ["1 234,56", 1234.56],
    ["1 234,56 €", 1234.56],
    ["20 %", 20],
    ["0", 0],
    ["-3", -3],
    [",5", 0.5],
  ])("parses %s", (input, expected) => {
    expect(parseFrNumber(input)).toBe(expected);
  });

  it.each(["", "abc", "12,5,3", "1.2.3", "€"])("rejects %s", (input) => {
    expect(parseFrNumber(input)).toBeNull();
  });
});

describe("formatters", () => {
  it("formats euros, percents and numbers the French way", () => {
    expect(formatEuro(1234.5)).toBe("1 234,50 €");
    expect(formatEuro(1234.5, true)).toBe("1 235 €");
    expect(formatPercent(0.256)).toBe("25,6 %");
    expect(formatNumber(2.5)).toBe("2,5");
  });

  it("rounds to the cent", () => {
    expect(roundCents(0.1 + 0.2)).toBe(0.3);
    expect(roundCents(1.005)).toBe(1.01);
  });
});
