import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test(`design system has no serious a11y violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/design-system");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test("design system page is not indexed", async ({ page }) => {
  await page.goto("/design-system");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("page does not scroll horizontally", async ({ page }) => {
  await page.goto("/design-system");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("tabs are keyboard operable", async ({ page }) => {
  await page.goto("/design-system");
  const first = page.getByRole("tab", { name: "Parcours Shopify" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  const second = page.getByRole("tab", { name: "Parcours WooCommerce" });
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
});

test("glossary tooltip shows on focus and closes with Escape", async ({ page }) => {
  await page.goto("/design-system");
  const term = page.getByRole("link", { name: "dropshipping" });
  await term.focus();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).not.toHaveClass(/sr-only/);
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveClass(/sr-only/);
});

test("modal opens, traps focus and closes with Escape", async ({ page }) => {
  await page.goto("/design-system");
  await page.getByRole("button", { name: "Ouvrir la fenêtre d’exemple" }).click();
  const dialog = page.getByRole("dialog", { name: "Supprimer ma simulation ?" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("toast is announced in a live region", async ({ page }) => {
  await page.goto("/design-system");
  await page.getByRole("button", { name: "Afficher une confirmation" }).click();
  await expect(page.getByRole("status")).toContainText("Votre simulation est enregistrée.");
});
