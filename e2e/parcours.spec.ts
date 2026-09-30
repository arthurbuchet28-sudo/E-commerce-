import { expect, test } from "@playwright/test";

const STEP = "/se-lancer/trouver-son-idee";

test("a step shows its objective, duration, deliverables, guides and tool", async ({ page }) => {
  await page.goto(STEP);
  await expect(page.getByText("Objectif", { exact: true })).toBeVisible();
  await expect(page.getByText("Durée indicative")).toBeVisible();
  await expect(page.getByRole("heading", { name: "À la fin, vous aurez…" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Les 6 modèles de e-commerce/ })).toBeVisible();
  // Every planned guide of the first step is written: nothing is announced « à paraître ».
  await expect(page.getByRole("link", { name: /Dropshipping/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "À paraître" })).toHaveCount(0);
  await expect(page.getByText("Outil lié")).toBeVisible();
  await expect(page.getByRole("link", { name: /Étape suivante/ })).toHaveAttribute(
    "href",
    "/se-lancer/valider-le-marche",
  );
});

test("checklist progress is saved and reflected on the overview", async ({ page }) => {
  await page.goto(STEP);
  await page.waitForLoadState("networkidle");
  const boxes = page
    .getByRole("group", { name: "Ma checklist pour cette étape" })
    .getByRole("checkbox");
  const count = await boxes.count();
  for (let i = 0; i < count; i++) await boxes.nth(i).check();
  await expect(page.getByText("Étape terminée. Bravo.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Passer à l’étape suivante/ })).toBeVisible();

  await page.reload();
  await expect(boxes.first()).toBeChecked();

  await page.goto("/se-lancer");
  const stepper = page.getByRole("navigation", { name: "Les 8 étapes du parcours" });
  await expect(stepper.getByText("Étape 1 · terminée")).toBeVisible();
  await expect(stepper.getByText("Étape 2 · prochaine étape")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(count));

  await page.goto("/");
  await expect(page.getByText("Étape 1 · terminée")).toBeVisible();
});

test("progress can be cleared after confirmation", async ({ page }) => {
  await page.goto(STEP);
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("group", { name: "Ma checklist pour cette étape" })
    .getByRole("checkbox")
    .first()
    .check();
  await page.goto("/se-lancer");
  await page.getByRole("button", { name: "Effacer ma progression" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Effacer ma progression" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByText("Étape 1 · prochaine étape")).toBeVisible();
});

test("the path works without any cookie", async ({ page, context }) => {
  await page.goto(STEP);
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("group", { name: "Ma checklist pour cette étape" })
    .getByRole("checkbox")
    .first()
    .check();
  expect(await context.cookies()).toEqual([]);
});
