import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const tools = [
  "/outils",
  "/outils/calculateur-prix-marge",
  "/outils/simulateur-micro-entreprise",
  "/outils/seuil-de-rentabilite",
  "/outils/quel-modele-ecommerce",
  "/outils/comparateur-plateformes",
  "/outils/checklist-lancement",
];

async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

for (const path of tools) {
  test(`${path} is accessible and explains its method`, async ({ page }) => {
    await ready(page, path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    if (path !== "/outils") {
      await expect(page.getByRole("heading", { name: "Méthode de calcul" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Hypothèses" })).toBeVisible();
    }
  });
}

test("price calculator updates the net margin and flags losses", async ({ page }) => {
  await ready(page, "/outils/calculateur-prix-marge");
  const sheet = page.getByRole("figure").filter({ hasText: "Ce qu’il vous reste par commande" });
  // 39 + 4,90 − 12 − 1 − 5 = 25,90 €
  await expect(sheet).toContainText("25,90");
  await page.getByLabel("Prix de vente TTC").fill("5");
  await expect(page.getByText("Chaque vente vous coûte de l’argent")).toBeVisible();
  await page.getByLabel("Prix de vente TTC").fill("abc");
  await expect(page.getByText("Saisissez un nombre, par exemple 12,50.")).toBeVisible();
  await expect(page.getByText("Calcul en attente")).toBeVisible();
});

test("micro simulator raises threshold alerts", async ({ page }) => {
  await ready(page, "/outils/simulateur-micro-entreprise");
  await page.getByLabel("pour l’année").check();
  await page.getByLabel(/Chiffre d’affaires annuel encaissé/).fill("90000");
  await expect(
    page.getByRole("paragraph").filter({ hasText: /^Seuil de franchise de TVA dépassé$/ }),
  ).toBeVisible();
  await page.getByLabel(/Chiffre d’affaires annuel encaissé/).fill("250000");
  await expect(
    page.getByRole("paragraph").filter({ hasText: /^Plafond de la micro-entreprise dépassé$/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("paragraph").filter({ hasText: /^Seuil majoré de franchise de TVA dépassé$/ }),
  ).toBeVisible();
});

test("break-even shows sales needed and a data table", async ({ page }) => {
  await ready(page, "/outils/seuil-de-rentabilite");
  await expect(
    page.getByRole("figure").filter({ hasText: "Votre seuil de rentabilité" }),
  ).toContainText("25");
  await page.getByText("Voir les données en tableau").click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Marge par vente").fill("0");
  await expect(page.getByText("Seuil impossible à atteindre")).toBeVisible();
});

test("quiz requires all answers and recommends a model", async ({ page }) => {
  await ready(page, "/outils/quel-modele-ecommerce");
  await page.getByRole("button", { name: "Voir ma recommandation" }).click();
  await expect(page.getByText("Choisissez une réponse pour continuer.").first()).toBeVisible();
  for (const group of await page.locator("fieldset").all()) {
    await group.getByRole("radio").first().check();
  }
  await page.getByRole("button", { name: "Voir ma recommandation" }).click();
  await expect(page.getByText("Le modèle qui vous correspond le mieux")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeFocused();
  await expect(page.getByText("Une orientation, pas une promesse")).toBeVisible();
});

test("comparator filters platforms", async ({ page, isMobile }) => {
  test.skip(isMobile, "table view is desktop only; mobile shows cards");
  await ready(page, "/outils/comparateur-plateformes");
  await page.getByLabel("Type de solution").selectOption("marketplace");
  await expect(page.getByRole("rowheader", { name: /Shopify/ })).toHaveCount(0);
  await expect(page.getByRole("rowheader", { name: /Etsy/ })).toBeVisible();
  await page.getByLabel("Mon profil").selectOption("revente");
  await expect(page.getByRole("rowheader", { name: /Etsy/ })).toHaveCount(0);
  await expect(page.getByRole("rowheader", { name: /Vinted Pro/ })).toBeVisible();
});

test("comparator shows cards on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout");
  await ready(page, "/outils/comparateur-plateformes");
  await page.getByLabel("Type de solution").selectOption("marketplace");
  await expect(page.getByRole("heading", { name: "Etsy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shopify" })).toHaveCount(0);
});

test("launch checklist is saved and exported as PDF", async ({ page }) => {
  await ready(page, "/outils/checklist-lancement");
  await page.getByLabel("J’ai reçu mon numéro SIRET.").check();
  await page.reload();
  await expect(page.getByLabel("J’ai reçu mon numéro SIRET.")).toBeChecked();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Télécharger ma checklist en PDF" }).click();
  expect((await download).suggestedFilename()).toBe("checklist-lancement.pdf");
});
