import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { routes } from "../src/config/routes";
import { guideCategories } from "../src/data/categories";
import { parcoursSteps } from "../src/data/parcours";

const pages = [
  "/",
  ...routes.map((r) => r.path),
  `/se-lancer/${parcoursSteps[0].slug}`,
  `/guides/${guideCategories[0].slug}`,
  "/guides/idee-et-produit/les-6-modeles-de-e-commerce",
  "/glossaire/dropshipping",
];

for (const path of pages) {
  test(`${path} renders, is accessible and typographically correct`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main#contenu")).toHaveCount(1);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Se rétracter" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Gérer mes cookies" })).toBeVisible();

    const text = await page.locator("body").innerText();
    expect(text, "regular space before : ; ! ?").not.toMatch(/ [:;!?](?=\s|$)/m);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test("private pages are noindex", async ({ page }) => {
  for (const r of routes.filter((x) => !x.indexable)) {
    await page.goto(r.path);
    await expect(page.locator('meta[name="robots"]'), r.path).toHaveAttribute("content", /noindex/);
  }
});

test("unknown pages return a helpful 404", async ({ page }) => {
  const response = await page.goto("/cette-page-n-existe-pas");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cette page est introuvable");
  await expect(page.getByRole("link", { name: /Reprendre le parcours/ })).toBeVisible();
});

test("skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/guides");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Aller au contenu" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#contenu")).toBeFocused();
});

test("current section is marked in the main navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation");
  await page.goto("/outils/seuil-de-rentabilite");
  const nav = page.getByRole("navigation", { name: "Navigation principale", exact: true });
  await expect(nav.getByRole("link", { name: "Outils" })).toHaveAttribute("aria-current", "page");
});

test("mobile menu opens and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const menu = page.getByRole("navigation", { name: "Navigation principale (mobile)" });
  await menu.getByRole("link", { name: "Guides" }).click();
  await expect(page).toHaveURL(/\/guides$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("robots.txt blocks crawling outside production and sitemap lists public pages", async ({
  request,
}) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/guides/idee-et-produit");
  expect(sitemap).not.toContain("/compte");
  expect(sitemap).not.toContain("/admin");
});
