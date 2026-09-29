import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const GUIDE = "/guides/idee-et-produit/se-lancer-dans-le-e-commerce";
const LEGAL_GUIDE = "/guides/legal-et-conformite/droit-de-retractation-fonction-en-ligne";

const pages = [
  GUIDE,
  LEGAL_GUIDE,
  "/guides/statut-et-creation/micro-entreprise-plafonds-tva-seuils",
  "/glossaire/franchise-en-base-de-tva",
];

for (const path of pages) {
  test(`${path} is accessible and typographically correct`, async ({ page }) => {
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/ [:;!?](?=\s|$)/m);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test("guide shows answer, update date, sources, FAQ and structured data", async ({ page }) => {
  await page.goto(GUIDE);
  await expect(page.getByText("En bref")).toBeVisible();
  await expect(page.getByText(/Mis à jour le/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Questions fréquentes" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ce que vous pouvez faire aujourd’hui" }),
  ).toBeVisible();
  const types = await page.locator('script[type="application/ld+json"]').allTextContents();
  const parsed = types.map((t) => JSON.parse(t)["@type"]);
  expect(parsed).toEqual(expect.arrayContaining(["Article", "BreadcrumbList", "FAQPage"]));
});

test("long guide has a table of contents with working anchors", async ({ page, isMobile }) => {
  await page.goto(GUIDE);
  const toc = isMobile
    ? page.getByRole("navigation", { name: "Sommaire" }).first()
    : page.getByRole("navigation", { name: "Sommaire" }).last();
  const link = toc.getByRole("link").first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  await expect(page.locator(href!)).toHaveCount(1);
});

test("figures display their source and check date", async ({ page }) => {
  await page.goto(GUIDE);
  await expect(page.getByText("196,4 Md€").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Source\s: Fevad.*vérifiée en septembre 2026/ }).first(),
  ).toBeVisible();
});

test("legal guides show the standard disclaimer", async ({ page }) => {
  await page.goto(LEGAL_GUIDE);
  await expect(page.getByRole("note")).toContainText(
    "ne remplace pas l’avis d’un expert-comptable ou d’un avocat",
  );
});

test("glossary term shows its definition on focus", async ({ page }) => {
  await page.goto(GUIDE);
  const term = page.getByRole("link", { name: "marketplaces", exact: true });
  await term.focus();
  await expect(page.getByRole("tooltip").filter({ hasText: "vendeurs tiers" })).toBeVisible();
});

test("guides can be filtered", async ({ page }) => {
  await page.goto("/guides");
  await page.getByLabel("Catégorie", { exact: true }).selectOption("legal-et-conformite");
  await expect(page.locator("p[aria-live=polite]", { hasText: /^2 guides$/ })).toBeVisible();
  await page.getByLabel("Niveau", { exact: true }).selectOption("intermediaire");
  await expect(page.getByText("Aucun guide ne correspond à ces filtres.")).toBeVisible();
});

test("checklist progress is kept after reload", async ({ page }) => {
  await page.goto(LEGAL_GUIDE);
  const box = page.getByRole("checkbox").first();
  await box.check();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
});

test("search opens with « / » and finds guides and glossary terms", async ({ page }) => {
  await page.goto("/");
  // Wait for hydration: the shortcut listener is attached client-side.
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("/");
  const input = page.getByRole("searchbox", { name: "Termes recherchés" });
  await expect(input).toBeFocused();
  await input.fill("franchise");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("region", { name: "Glossaire" })).toBeVisible();
  await expect(dialog.getByRole("region", { name: "Guide" })).toBeVisible();
  await dialog.getByRole("region", { name: "Glossaire" }).getByRole("link").first().click();
  await expect(page).toHaveURL(/\/glossaire\//);
});

test("RSS, llms.txt and social image are served", async ({ request }) => {
  const rss = await request.get("/veille-reglementaire/rss.xml");
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  expect(await rss.text()).toContain("<item>");
  const llms = await request.get("/llms.txt");
  expect(await llms.text()).toContain("# Première Vente");
  const og = await request.get(`${GUIDE}/opengraph-image`);
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toBe("image/png");
});
