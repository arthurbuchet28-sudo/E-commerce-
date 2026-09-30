import { readdirSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { routes } from "../src/config/routes";

import {
  adminRest,
  createMember,
  signIn,
  supabaseAvailable,
  uniqueEmail,
  userIdFor,
} from "./helpers/supabase";

/**
 * Phase 14 audit: every guide and glossary page (drafts included) is accessible, no internal
 * link is broken, the CSP never blocks anything, security headers are present, and the
 * JavaScript sent on key pages stays under budget.
 */

const CONTENT = path.join(__dirname, "..", "content");
const mdxSlugs = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? mdxSlugs(path.join(dir, e.name)).map((s) => `${e.name}/${s}`)
      : e.name.endsWith(".mdx")
        ? [e.name.replace(/\.mdx$/, "")]
        : [],
  );
const contentPages = [
  ...mdxSlugs(path.join(CONTENT, "guides")).map((s) => `/guides/${s}`),
  ...mdxSlugs(path.join(CONTENT, "glossaire")).map((s) => `/glossaire/${s}`),
];

const KEY_PAGES = [
  "/",
  "/guides",
  "/guides/statut-et-creation/statut-pour-vendre-en-ligne",
  "/se-lancer",
  "/outils/calculateur-prix-marge",
  "/outils/simulateur-micro-entreprise",
  "/formations",
  "/formations/les-bases-du-e-commerce",
  "/compte/connexion",
];

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

/** Records CSP violations (event + console) from the first script of every document. */
async function watchCsp(page: Page) {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy/i.test(m.text())) violations.push(m.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`Content Security Policy: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return violations;
}

test.describe("every content page", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "desktop sweep"));

  for (const url of contentPages) {
    test(`${url} is accessible`, async ({ page }) => {
      expect((await page.goto(url))?.status(), url).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await page.locator("main").innerText()).not.toMatch(/ [:;!?](?=\s|$)/m);
      await expectAccessible(page);
    });
  }
});

test("heading structure and landmarks are consistent on every static page", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop only");
  test.setTimeout(180_000);
  const problems: string[] = [];
  for (const url of [...routes.map((r) => r.path), "/guides/idee-et-produit"]) {
    const res = await page.goto(url);
    // Private pages redirect to sign-in: covered by their own specs.
    if (!res || res.status() >= 400 || new URL(page.url()).pathname !== url) continue;
    const results = await new AxeBuilder({ page })
      .withRules(["heading-order", "empty-heading", "page-has-heading-one", "landmark-unique"])
      .analyze();
    for (const v of results.violations) {
      problems.push(`${url} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    }
  }
  expect(problems).toEqual([]);
});

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });
  for (const url of KEY_PAGES) {
    test(`${url} is accessible in dark mode`, async ({ page }) => {
      await page.goto(url);
      await expectAccessible(page);
    });
  }
});

test("no internal link is broken", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "desktop only");
  test.setTimeout(240_000);
  const seen = new Set<string>(["/"]);
  const queue = ["/", "/plan-du-site", ...contentPages];
  for (const p of queue) seen.add(p);
  const broken: string[] = [];
  while (queue.length) {
    const from = queue.shift()!;
    const res = await request.get(from, { maxRedirects: 0 });
    if (res.status() >= 400) {
      broken.push(`${from} → ${res.status()}`);
      continue;
    }
    if (!(res.headers()["content-type"] ?? "").includes("text/html")) continue;
    const html = await res.text();
    for (const [, raw] of html.matchAll(/<a\b[^>]*\shref="([^"#]*)(?:#[^"]*)?"/g)) {
      if (!raw.startsWith("/") || raw.startsWith("//")) continue;
      const target = raw.replace(/&amp;/g, "&");
      if (seen.has(target)) continue;
      seen.add(target);
      // Only follow public pages; private areas answer with a redirect to sign in.
      if (/^\/(compte|apprendre|admin|api|panier|commande|paiement-simule|auth)\b/.test(target)) {
        const r = await request.get(target, { maxRedirects: 0 });
        if (r.status() >= 400 && r.status() !== 401)
          broken.push(`${from} → ${target} (${r.status()})`);
        continue;
      }
      queue.push(target);
    }
  }
  expect(broken).toEqual([]);
  expect(seen.size).toBeGreaterThan(150);
  await page.close();
});

test.describe("security headers", () => {
  test("static pages get the static CSP and the baseline headers", async ({ request }) => {
    const headers = (await request.get("/guides")).headers();
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).not.toContain("nonce-");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("private pages get a single, nonce-based CSP", async ({ request }) => {
    const res = await request.get("/compte/connexion");
    const csp = res
      .headersArray()
      .filter((h) => h.name.toLowerCase() === "content-security-policy");
    expect(csp).toHaveLength(1);
    expect(csp[0].value).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(csp[0].value).not.toContain("unsafe-inline' 'nonce");
    const html = await res.text();
    const nonce = csp[0].value.match(/'nonce-([^']+)'/)![1];
    const scripts = html.match(/<script\b[^>]*>/g) ?? [];
    for (const tag of scripts.filter((t) => !t.includes("application/ld+json"))) {
      expect(tag).toContain(`nonce="${nonce}"`);
    }
  });
});

test.describe("CSP blocks nothing the site needs", () => {
  test("public pages hydrate without violation", async ({ page }) => {
    const violations = await watchCsp(page);
    for (const url of KEY_PAGES) {
      await page.goto(url);
      await page.waitForFunction(() => "next" in window);
    }
    // Interactive island: the calculator computes (JavaScript ran).
    await page.goto("/outils/calculateur-prix-marge");
    await expect(page.locator("[aria-live]").first()).not.toBeEmpty();
    expect(violations).toEqual([]);
  });

  test("site search (WebAssembly) works under the strict CSP", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    const violations = await watchCsp(page);
    await page.goto("/compte/connexion");
    await page.waitForFunction(() => "next" in window);
    await page.keyboard.press("/");
    await page.getByRole("searchbox", { name: "Termes recherchés" }).fill("franchise");
    await expect(page.getByRole("dialog").getByRole("region", { name: "Glossaire" })).toBeVisible();
    expect(violations).toEqual([]);
  });

  test("member, lesson and back-office pages work under the strict CSP", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile || !(await supabaseAvailable()), "desktop with local Supabase");
    const violations = await watchCsp(page);
    const email = uniqueEmail("csp");
    await createMember(email);
    await adminRest(`profiles?id=eq.${await userIdFor(email)}`, {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });
    await signIn(page, email, "/compte");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const url of [
      "/compte",
      "/apprendre/les-bases-du-e-commerce/panorama",
      "/panier?formation=trouver-et-valider-son-produit",
      "/admin",
      "/admin/formations",
    ]) {
      await page.goto(url);
      // The Next.js runtime started: its scripts were not blocked.
      await page.waitForFunction(() => "next" in window);
    }
    expect(violations).toEqual([]);
  });
});

test.describe("JavaScript budget", () => {
  const BUDGET = 150 * 1024;
  for (const url of [...KEY_PAGES, "/outils/seuil-de-rentabilite", "/outils/checklist-lancement"]) {
    test(`${url} loads less than 150 KB of compressed JavaScript`, async ({ page, isMobile }) => {
      test.skip(isMobile, "same bundles on mobile");
      const html = (await (await page.goto(url))?.text()) ?? "";
      await page.waitForLoadState("load");
      // First-load JavaScript: the scripts of the initial HTML, except the `nomodule` polyfills
      // that modern browsers skip (link prefetches of other pages are not counted).
      const srcs = [
        ...new Set(
          [...html.matchAll(/<script\b([^>]*)>/g)]
            .map(([, attrs]) => attrs)
            .filter((attrs) => !/nomodule/i.test(attrs))
            .map((attrs) => attrs.match(/src="([^"]+)"/)?.[1])
            .filter((src): src is string => Boolean(src)),
        ),
      ];
      expect(srcs.length).toBeGreaterThan(0);
      const sizes = await page.evaluate(
        (list) =>
          list.map((src) => {
            const entry = performance.getEntriesByName(new URL(src, location.href).href)[0];
            return (entry as PerformanceResourceTiming | undefined)?.encodedBodySize ?? -1;
          }),
        srcs,
      );
      expect(sizes, "every script was loaded").not.toContain(-1);
      const total = sizes.reduce((a, b) => a + b, 0);
      expect(total, `${url}: ${Math.round(total / 1024)} KB`).toBeLessThan(BUDGET);
    });
  }
});
