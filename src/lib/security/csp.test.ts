import { describe, expect, it } from "vitest";

import { buildCsp, usesStrictCsp } from "./csp";

const directive = (csp: string, name: string) =>
  csp
    .split("; ")
    .find((d) => d.startsWith(`${name} `))
    ?.slice(name.length + 1)
    .split(" ");

describe("buildCsp", () => {
  it("locks down plugins, framing, base and forms on every page", () => {
    for (const csp of [buildCsp(), buildCsp({ nonce: "abc" })]) {
      expect(directive(csp, "object-src")).toEqual(["'none'"]);
      expect(directive(csp, "frame-ancestors")).toEqual(["'none'"]);
      expect(directive(csp, "base-uri")).toEqual(["'self'"]);
      expect(directive(csp, "form-action")).toEqual(["'self'", "https://checkout.stripe.com"]);
      expect(directive(csp, "frame-src")).toEqual(["https://iframe.mediadelivery.net"]);
    }
  });

  it("uses a nonce and strict-dynamic, without unsafe-inline, on strict pages", () => {
    const script = directive(buildCsp({ nonce: "abc" }), "script-src");
    expect(script).toEqual(["'self'", "'nonce-abc'", "'strict-dynamic'", "'wasm-unsafe-eval'"]);
  });

  it("allows inline scripts but no foreign origin on static pages", () => {
    expect(directive(buildCsp(), "script-src")).toEqual([
      "'self'",
      "'unsafe-inline'",
      "'wasm-unsafe-eval'",
    ]);
    expect(directive(buildCsp(), "connect-src")).toEqual(["'self'"]);
  });

  it("allows the Matomo origin only when configured", () => {
    const csp = buildCsp({ matomoUrl: "https://exemple.matomo.cloud/" });
    expect(directive(csp, "script-src")).toContain("https://exemple.matomo.cloud");
    expect(directive(csp, "connect-src")).toContain("https://exemple.matomo.cloud");
    expect(directive(csp, "img-src")).toContain("https://exemple.matomo.cloud");
    expect(buildCsp({ matomoUrl: "pas une url" })).not.toContain("pas une url");
  });

  it("adds unsafe-eval in development only", () => {
    expect(directive(buildCsp({ isDev: true }), "script-src")).toContain("'unsafe-eval'");
    expect(directive(buildCsp(), "script-src")).not.toContain("'unsafe-eval'");
  });

  it("upgrades insecure requests only on an HTTPS site", () => {
    expect(buildCsp({ siteUrl: "https://premiere-vente.fr" })).toContain(
      "upgrade-insecure-requests",
    );
    expect(buildCsp({ siteUrl: "http://localhost:3000" })).not.toContain("upgrade-insecure");
  });
});

describe("usesStrictCsp", () => {
  it("matches private route prefixes, not look-alikes", () => {
    expect(usesStrictCsp("/compte")).toBe(true);
    expect(usesStrictCsp("/compte/connexion")).toBe(true);
    expect(usesStrictCsp("/apprendre/f0/intro")).toBe(true);
    expect(usesStrictCsp("/admin")).toBe(true);
    expect(usesStrictCsp("/comptes")).toBe(false);
    expect(usesStrictCsp("/guides")).toBe(false);
    expect(usesStrictCsp("/")).toBe(false);
  });
});
