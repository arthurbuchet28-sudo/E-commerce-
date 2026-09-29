import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import {
  authLinkFor,
  createMember,
  PASSWORD,
  signIn,
  supabaseAvailable,
  uniqueEmail,
} from "./helpers/supabase";

test.beforeEach(async ({ isMobile }, testInfo) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  // Account flows are exercised once (desktop); accessibility runs on both projects.
  if (!testInfo.title.startsWith("a11y")) test.skip(isMobile, "desktop only");
});

test("sign-up requires CGU acceptance, then confirms the e-mail and opens the dashboard", async ({
  page,
}) => {
  const email = uniqueEmail("signup");
  await page.goto("/compte/inscription");
  await page.getByLabel("Prénom ou pseudonyme").fill("Léa");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel(/^Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(
    page.getByText("Acceptez les conditions générales d’utilisation pour créer votre compte."),
  ).toBeVisible();
  await expect(page.getByLabel(/J’accepte les conditions générales/)).not.toBeChecked();

  // The e-mail and name are kept after the error; the password is never echoed back.
  await expect(page.getByLabel("Adresse e-mail")).toHaveValue(email);
  await page.getByLabel(/^Mot de passe/).fill(PASSWORD);
  await page.getByLabel(/J’accepte les conditions générales/).check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("status")).toContainText(
    "un e-mail de confirmation vient de vous être envoyé",
  );

  await page.goto(await authLinkFor(email));
  await expect(page).toHaveURL(/\/compte$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bonjour Léa");
});

test("weak passwords and wrong credentials give clear messages", async ({ page }) => {
  await page.goto("/compte/inscription");
  await page.getByLabel("Adresse e-mail").fill(uniqueEmail("weak"));
  await page.getByLabel(/^Mot de passe/).fill("court");
  await page.getByLabel(/J’accepte les conditions générales/).check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(
    page.getByText("Choisissez un mot de passe d’au moins 10 caractères."),
  ).toBeVisible();

  await page.goto("/compte/connexion");
  await page.getByLabel("Adresse e-mail").first().fill(uniqueEmail("nobody"));
  await page.getByLabel(/^Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Me connecter" }).click();
  await expect(page.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();
  await expect(page.getByLabel("Adresse e-mail").first()).not.toHaveValue("");
});

test("protected pages redirect to sign-in and back", async ({ page }) => {
  const email = uniqueEmail("next");
  await createMember(email);
  await page.goto("/compte");
  await expect(page).toHaveURL(/\/compte\/connexion\?next=(%2F|\/)compte/);
  await page.getByLabel("Adresse e-mail").first().fill(email);
  await page.getByLabel(/^Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Me connecter" }).click();
  await expect(page).toHaveURL(/\/compte$/);
  await page.getByRole("button", { name: "Me déconnecter" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/compte");
  await expect(page).toHaveURL(/connexion/);
});

test("magic link signs the member in", async ({ page }) => {
  const email = uniqueEmail("magic");
  await createMember(email);
  await page.goto("/compte/connexion");
  await page.getByLabel("Adresse e-mail").nth(1).fill(email);
  await page.getByRole("button", { name: "Recevoir un lien de connexion" }).click();
  await expect(page.getByRole("status")).toContainText(
    "un lien de connexion vient de lui être envoyé",
  );
  await page.goto(await authLinkFor(email));
  await expect(page).toHaveURL(/\/compte$/);
});

test("password reset by e-mail", async ({ page }) => {
  const email = uniqueEmail("reset");
  await createMember(email);
  await page.goto("/compte/mot-de-passe");
  await page.getByLabel("Adresse e-mail de votre compte").fill(email);
  await page.getByRole("button", { name: "Recevoir le lien de réinitialisation" }).click();
  await page.goto(await authLinkFor(email));
  await expect(page).toHaveURL(/nouveau-mot-de-passe/);
  await page.getByLabel(/^Nouveau mot de passe \(/).fill("Nouveau2026mdp");
  await page.getByLabel(/^Confirmez le nouveau mot de passe/).fill("Nouveau2026mdp");
  await page.getByRole("button", { name: "Enregistrer mon nouveau mot de passe" }).click();
  await expect(page.getByText("Votre nouveau mot de passe est enregistré.")).toBeVisible();
});

test("an expired or reused link shows a helpful message", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=invalide&type=email&next=/compte");
  await expect(page).toHaveURL(/erreur=lien/);
  await expect(page.getByText("Ce lien n’est plus valable")).toBeVisible();
});

test("path progress follows the member to another device", async ({ page, browser }) => {
  const email = uniqueEmail("sync");
  await createMember(email);
  await signIn(page, email);
  await page.goto("/se-lancer/trouver-son-idee");
  await page.waitForLoadState("networkidle");
  const saved = page.waitForResponse(
    (r) => r.url().includes("/api/compte/progression/parcours") && r.request().method() === "PUT",
  );
  await page
    .getByRole("group", { name: "Ma checklist pour cette étape" })
    .getByRole("checkbox")
    .first()
    .check();
  expect((await saved).ok()).toBe(true);

  const other = await browser.newContext();
  const page2 = await other.newPage();
  await signIn(page2, email, "/se-lancer/trouver-son-idee");
  await expect(
    page2
      .getByRole("group", { name: "Ma checklist pour cette étape" })
      .getByRole("checkbox")
      .first(),
  ).toBeChecked();
  await other.close();
});

test("simulations can be saved, reopened and deleted", async ({ page }) => {
  const email = uniqueEmail("simu");
  await createMember(email);
  await signIn(page, email, "/outils/calculateur-prix-marge");
  await page.getByLabel("Prix de vente TTC").fill("52");
  await page.getByLabel("Nom de la simulation").fill("Bague argent");
  await page.getByRole("button", { name: "Enregistrer ma simulation" }).click();
  await expect(page.getByText("Simulation enregistrée.")).toBeVisible();

  await page.goto("/compte");
  await expect(page.getByText("Bague argent", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Rouvrir la simulation « Bague argent »" }).click();
  await expect(page.getByLabel("Prix de vente TTC")).toHaveValue("52");

  await page.goto("/compte");
  await page.getByRole("button", { name: "Supprimer la simulation « Bague argent »" }).click();
  await expect(page.getByText("Aucune simulation enregistrée.")).toBeVisible();
});

test("anonymous visitors are invited to sign in to save a simulation", async ({ page }) => {
  await page.goto("/outils/seuil-de-rentabilite");
  await expect(page.getByRole("link", { name: "Connectez-vous" })).toHaveAttribute(
    "href",
    /next=%2Foutils%2Fseuil-de-rentabilite/,
  );
});

test("data export and account deletion (RGPD)", async ({ page }) => {
  const email = uniqueEmail("rgpd");
  await createMember(email);
  await signIn(page, email);

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exporter mes données" }).click();
  const file = await download;
  const content = JSON.parse(
    await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8")),
  );
  expect(content.account.email).toBe(email);
  expect(content.profile.display_name).toBe("Léa");

  await page.getByText("Supprimer mon compte").click();
  await page.getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
  await expect(page.getByText("Saisissez SUPPRIMER en majuscules pour confirmer.")).toBeVisible();
  await page.getByLabel("Pour confirmer, saisissez SUPPRIMER").fill("SUPPRIMER");
  await page.getByRole("button", { name: "Supprimer définitivement mon compte" }).click();
  await expect(page.getByText("Votre compte a été supprimé")).toBeVisible();

  await page.getByLabel("Adresse e-mail").first().fill(email);
  await page.getByLabel(/^Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Me connecter" }).click();
  await expect(page.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();
});

test("member API refuses anonymous and cross-origin requests", async ({ request, page }) => {
  expect((await request.get("/api/compte/progression/parcours")).status()).toBe(401);
  const email = uniqueEmail("csrf");
  await createMember(email);
  await signIn(page, email);
  const res = await page.request.put("/api/compte/progression/parcours", {
    headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
    data: { data: {}, clientUpdatedAt: new Date().toISOString() },
  });
  expect(res.status()).toBe(403);
  const invalid = await page.request.put("/api/compte/progression/parcours", {
    headers: { Origin: new URL(page.url()).origin, "Content-Type": "application/json" },
    data: { data: "not an object", clientUpdatedAt: "hier" },
  });
  expect(invalid.status()).toBe(400);
});

for (const path of ["/compte/connexion", "/compte/inscription", "/compte/mot-de-passe"]) {
  test(`a11y ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? "")),
    ).toEqual([]);
  });
}

test("a11y dashboard", async ({ page }) => {
  const email = uniqueEmail("a11y");
  await createMember(email);
  await signIn(page, email);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? "")),
  ).toEqual([]);
});
