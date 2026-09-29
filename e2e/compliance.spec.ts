import { expect, test } from "@playwright/test";

test("no cookie and no banner on public pages (no tracker requires consent)", async ({
  page,
  context,
}) => {
  for (const path of [
    "/",
    "/guides",
    "/outils/calculateur-prix-marge",
    "/formations",
    "/cookies",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Vos choix sur les cookies" })).toHaveCount(0);
  }
  expect(await context.cookies()).toEqual([]);
  // Audience measurement is not configured locally: nothing is loaded.
  await expect(page.locator("#matomo-script")).toHaveCount(0);
});

test("« Gérer mes cookies » opens the preference centre, and choices are remembered", async ({
  page,
}) => {
  await page.goto("/guides");
  await page.getByRole("contentinfo").getByRole("link", { name: "Gérer mes cookies" }).click();
  await expect(page).toHaveURL(/\/cookies#preferences$/);
  await expect(page.getByText(/Aucun traceur soumis à votre consentement/).first()).toBeVisible();
  const optOut = page.getByLabel("Ne pas être compté dans les statistiques de fréquentation");
  await expect(optOut).not.toBeChecked();
  await optOut.check();
  await page.getByRole("button", { name: "Enregistrer mes préférences" }).click();
  await expect(page.getByText("Vos préférences sont enregistrées.")).toBeVisible();
  await page.reload();
  await expect(
    page.getByLabel("Ne pas être compté dans les statistiques de fréquentation"),
  ).toBeChecked();
});

test("legal pages are flagged templates with the required information", async ({ page }) => {
  for (const path of [
    "/mentions-legales",
    "/cgv",
    "/cgu",
    "/confidentialite",
    "/cookies",
    "/accessibilite",
  ]) {
    await page.goto(path);
    await expect(
      page.getByText("Trame à faire valider par un professionnel du droit"),
    ).toBeVisible();
    await expect(page.getByText(/^Version 2026-09/)).toBeVisible();
  }
  await page.goto("/mentions-legales");
  await expect(page.getByText("Vercel Inc.")).toBeVisible();
  await page.goto("/cgv");
  await expect(
    page.getByRole("link", { name: "fonction de rétractation en ligne" }),
  ).toHaveAttribute("href", "/retractation");
  await page.goto("/confidentialite");
  await expect(page.getByRole("heading", { name: /Vous envoyer la newsletter/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sous-traitants" })).toBeVisible();
});

test("the consent banner offers three equal first-level choices", async ({ page }) => {
  await page.goto("/design-system#consentement");
  const section = page.locator("#consentement");
  const buttons = ["Tout accepter", "Tout refuser", "Personnaliser"].map((name) =>
    section.getByRole("button", { name, exact: true }),
  );
  const boxes = await Promise.all(buttons.map((b) => b.boundingBox()));
  for (const box of boxes) {
    expect(Math.abs(box!.height - boxes[0]!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(box!.width - boxes[0]!.width)).toBeLessThanOrEqual(2);
  }
  await buttons[2].click();
  const purpose = section.getByLabel("Mesure des campagnes publicitaires");
  await expect(purpose).not.toBeChecked();
  await section.getByRole("button", { name: "Tout refuser" }).click();
  await expect(section.getByText(/Choix\s:\stout refusé/)).toBeVisible();
});

test("no proof is recorded while no purpose requires consent", async ({ request }) => {
  const res = await request.post("/api/consentement", {
    data: { visitorId: "8f0c7a44-3a6b-4c5d-9e2f-1a2b3c4d5e6f", version: "2026-09-v1", choices: {} },
  });
  expect(res.status()).toBe(400);
});
