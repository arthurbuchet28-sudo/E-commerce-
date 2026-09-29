import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  adminRest,
  createMember,
  signIn,
  supabaseAvailable,
  uniqueEmail,
  userIdFor,
} from "./helpers/supabase";

test.beforeEach(async ({ isMobile }, testInfo) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  if (!testInfo.title.startsWith("a11y")) test.skip(isMobile, "desktop only");
});

/** Creates a member, gives them the admin role (service role only) and signs in. */
async function signInAsAdmin(page: Page, next = "/admin") {
  const email = uniqueEmail("admin");
  await createMember(email, "Admin");
  const res = await adminRest(`profiles?id=eq.${await userIdFor(email)}`, {
    method: "PATCH",
    body: JSON.stringify({ role: "admin" }),
  });
  expect(res.ok).toBe(true);
  await signIn(page, email, next);
  return email;
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test("the back-office is closed to visitors and members", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/compte\/connexion\?next=%2Fadmin/);

  const email = uniqueEmail("pas-admin");
  await createMember(email, "Membre");
  await signIn(page, email);
  const response = await page.goto("/admin/formations");
  expect(response?.status()).toBe(404);
  const csv = await page.request.get("/api/admin/export/newsletter");
  expect(csv.status()).toBe(404);
  expect((await request.get("/api/admin/export/achats")).status()).toBe(404);
});

test("admins build, publish and remove a course", async ({ page }) => {
  await signInAsAdmin(page);
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chiffres clés" })).toBeVisible();

  const stamp = Date.now();
  const slug = `formation-test-${stamp}`;
  const title = `Formation de test ${stamp}`;
  await page.goto("/admin/formations");
  await page.getByLabel(/^Titre/).fill(title);
  await page.getByLabel(/^Adresse \(slug\)/).fill(slug);
  await page.getByLabel(/^Code/).fill("FT");
  await page.getByRole("button", { name: "Créer la formation" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const courseUrl = page.url();

  // Publication is refused while the course is empty.
  await page.getByRole("button", { name: "Publier la formation" }).click();
  await expect(page.getByText(/Publication impossible.*aucun module/)).toBeVisible();

  // Presentation.
  await page.getByLabel(/^Résumé/).fill("Une formation créée par les tests.");
  await page.getByLabel(/^Pour qui/).fill("Personne");
  await page.getByRole("button", { name: "Enregistrer la présentation" }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();

  // Two modules, reordered.
  for (const title of ["Premier module", "Second module"]) {
    const add = page.getByRole("region", { name: "Ajouter un module" });
    await add.getByLabel(/^Titre/).fill(title);
    await add.getByRole("button", { name: "Ajouter le module" }).click();
    await expect(
      page.getByRole("heading", { name: new RegExp(`Module \\d · ${title}`) }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: /Monter.*Second module/ }).click();
  await expect(page.getByRole("heading", { name: "Module 1 · Second module" })).toBeVisible();

  // A lesson in each module (existing lesson texts).
  for (const [module, file] of [
    ["Second module", "les-bases-du-e-commerce/panorama.mdx"],
    ["Premier module", "les-bases-du-e-commerce/modeles.mdx"],
  ]) {
    const region = page.getByRole("region", { name: new RegExp(module) });
    await region.getByText("Ajouter une leçon").click();
    await region
      .getByLabel(/^Titre/)
      .first()
      .fill(`Leçon de ${module}`);
    await region
      .getByLabel(/^Adresse \(slug\)/)
      .fill(`lecon-${module.split(" ")[0].toLowerCase()}`);
    await region.getByLabel(/^Fichier du texte/).fill(file);
    await region.getByRole("button", { name: "Ajouter la leçon" }).click();
    await expect(region.getByText("Leçon ajoutée.")).toBeVisible();
  }

  // Quiz with its answer.
  await page
    .getByRole("link", { name: /Quiz du module.*0 question/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/quiz\//);
  await page.getByLabel("Question (obligatoire)").fill("Combien font deux et deux ?");
  await page.getByLabel(/^Réponses proposées/).fill("Trois\nQuatre");
  await page.getByLabel(/^Numéro de la bonne réponse/).fill("2");
  await page.getByLabel(/^Explication/).fill("Deux plus deux font quatre.");
  await page.getByRole("button", { name: "Ajouter la question" }).click();
  await expect(page.getByRole("heading", { name: "Question 1" })).toBeVisible();
  await expect(page.getByLabel(/^Numéro de la bonne réponse/).first()).toHaveValue("2");

  // Publish, check the public page, unpublish, delete.
  await page.goto(courseUrl);
  await page.getByRole("button", { name: "Publier la formation" }).click();
  await expect(page.getByText("Formation publiée.")).toBeVisible();
  await page.goto(`/formations/${slug}`);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("Quiz de fin de module")).toBeVisible();

  await page.goto(courseUrl);
  await page.getByRole("button", { name: "Repasser en brouillon" }).click();
  await expect(page.getByText("Formation repassée en brouillon.")).toBeVisible();
  const danger = page.getByRole("region", { name: "Supprimer la formation" });
  await danger.getByRole("button", { name: "Supprimer la formation" }).click();
  await expect(danger.getByText("Cochez la case de confirmation pour supprimer.")).toBeVisible();
  await danger.getByLabel(/Je confirme la suppression définitive/).check();
  await danger.getByRole("button", { name: "Supprimer la formation" }).click();
  await expect(page).toHaveURL(/\/admin\/formations$/);
  await expect(page.getByRole("link", { name: new RegExp(title) })).toHaveCount(0);
});

test("admins attach PDF resources and refuse other files", async ({ page }) => {
  await signInAsAdmin(page, "/admin/formations");
  await page.getByRole("link", { name: /Trouver et valider son produit/ }).click();
  const lesson = page.getByRole("listitem").filter({ hasText: "Les critères d’un bon produit" });
  await lesson.getByText("Modifier la leçon").click();
  const label = `Fiche test ${Date.now()}`;
  await lesson.getByLabel(/^Intitulé/).fill(label);
  await lesson.getByLabel(/^Fichier PDF/).setInputFiles({
    name: "virus.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("MZ not a pdf"),
  });
  await lesson.getByRole("button", { name: "Ajouter la ressource" }).click();
  await expect(lesson.getByText("Ce fichier n’est pas un PDF valide.")).toBeVisible();

  await lesson.getByLabel(/^Fichier PDF/).setInputFiles({
    name: "Fiche test.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n%%EOF\n"),
  });
  await lesson.getByLabel(/^Intitulé/).fill(label);
  await lesson.getByRole("button", { name: "Ajouter la ressource" }).click();
  await expect(lesson.getByText("Ressource ajoutée.")).toBeVisible();
  await expect(lesson.getByText(label, { exact: true })).toBeVisible();

  const resource = lesson.getByRole("group", { name: label });
  await resource.getByLabel(/Je confirme la suppression/).check();
  await resource.getByRole("button", { name: "Supprimer la ressource" }).click();
  await expect(page.getByText(label)).toHaveCount(0);
});

test("admins find students and export purchases and subscribers", async ({ page }) => {
  const email = await signInAsAdmin(page, "/admin/eleves");
  await page.getByLabel("Rechercher (e-mail ou nom)").fill(email);
  await page.getByRole("search").getByRole("button", { name: "Rechercher" }).click();
  await expect(page.getByRole("status")).toContainText("1 membre");
  await expect(page.getByRole("table").getByText(email)).toBeVisible();

  await page.goto("/admin/achats");
  await expect(
    page.getByRole("heading", { level: 1, name: "Achats et remboursements" }),
  ).toBeVisible();
  const orders = await page.request.get("/api/admin/export/achats");
  expect(orders.status()).toBe(200);
  expect(orders.headers()["content-type"]).toContain("text/csv");
  expect(await orders.text()).toMatch(/^﻿"commande";"payee_le"/);

  await page.goto("/admin/newsletter");
  const subscribers = await page.request.get("/api/admin/export/newsletter");
  expect(subscribers.status()).toBe(200);
  const csv = await subscribers.text();
  expect(csv).toMatch(/^﻿"email";"origine";"confirme_le"/);
  expect(csv).not.toMatch(/access_token/);
});

test("a11y: back-office pages have no serious violations", async ({ page }) => {
  await signInAsAdmin(page);
  await axe(page);
  for (const path of ["/admin/formations", "/admin/eleves", "/admin/achats", "/admin/newsletter"]) {
    await page.goto(path);
    await axe(page);
  }
  await page.goto("/admin/formations");
  await page.getByRole("link", { name: /Les bases du e-commerce/ }).click();
  await axe(page);
});
