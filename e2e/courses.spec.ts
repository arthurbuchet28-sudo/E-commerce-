import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { createMember, signIn, supabaseAvailable, uniqueEmail } from "./helpers/supabase";

const FREE = "les-bases-du-e-commerce";
const PAID = "trouver-et-valider-son-produit";
// Correct answers of the seed quizzes (supabase/seed.sql).
const ANSWERS: Record<string, number[]> = {
  "quiz-module-1": [1, 0, 2, 0],
  "quiz-module-2": [1, 1, 0, 0],
};

test.beforeEach(async ({ isMobile }, testInfo) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  if (!testInfo.title.startsWith("a11y")) test.skip(isMobile, "desktop only");
});

async function answerQuiz(page: Page, answers: number[]) {
  const groups = page.locator("fieldset");
  for (let i = 0; i < answers.length; i++)
    await groups.nth(i).getByRole("radio").nth(answers[i]).check();
  await page.getByRole("button", { name: "Valider mes réponses" }).click();
}

test("catalogue and course page present the offer honestly", async ({ page }) => {
  await page.goto("/formations");
  await expect(page.getByRole("link", { name: "Les bases du e-commerce" })).toBeVisible();
  await expect(page.getByText("Gratuite (avec un compte)")).toBeVisible();
  await expect(page.getByText("49 € TTC")).toBeVisible();
  await expect(page.getByText(/ni un diplôme ni une certification/)).toBeVisible();

  await page.goto(`/formations/${PAID}`);
  await expect(page.getByRole("heading", { name: "Programme" })).toBeVisible();
  await expect(page.getByText("Aperçu gratuit")).toBeVisible();
  await expect(page.getByRole("button", { name: "Acheter la formation" })).toBeDisabled();
  const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (t) => JSON.parse(t)["@type"],
  );
  expect(types).toContain("Course");
});

test("preview lessons are open to everyone, other lessons are protected", async ({ page }) => {
  await page.goto(`/apprendre/${PAID}/criteres-bon-produit`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Les critères d’un bon produit à vendre en ligne",
  );
  await expect(page.getByText("Vous regardez une leçon gratuite")).toBeVisible();
  await expect(page.getByText(/Vidéo à venir/)).toBeVisible();
  await expect(page.getByText("Lire la transcription")).toBeVisible();

  await page.goto(`/apprendre/${PAID}/analyser-concurrence`);
  await expect(page).toHaveURL(/\/compte\/connexion\?next=/);

  const email = uniqueEmail("paid");
  await createMember(email);
  await signIn(page, email, `/apprendre/${PAID}/analyser-concurrence`);
  // Signed in but without purchase: back to the course page.
  await expect(page).toHaveURL(new RegExp(`/formations/${PAID}$`));
});

test("a member completes the free course, passes the quizzes and gets the certificate", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const email = uniqueEmail("course");
  await createMember(email, "Karim");
  await signIn(page, email, `/formations/${FREE}`);
  await page.getByRole("button", { name: "Commencer gratuitement" }).click();
  await expect(page).toHaveURL(new RegExp(`/apprendre/${FREE}/panorama$`));

  // Lessons 1–3, then a failed and a passed quiz.
  for (const slug of ["panorama", "modeles", "etapes"]) {
    await expect(page).toHaveURL(new RegExp(`/${slug}$`));
    await page.getByRole("button", { name: /Marquer comme terminée/ }).click();
  }
  await expect(page).toHaveURL(/quiz-module-1$/);
  await answerQuiz(page, [0, 1, 0, 1]);
  await expect(page.getByRole("heading", { name: "Module pas encore validé" })).toBeFocused();
  await expect(page.getByText(/Bonne réponse/).first()).toBeVisible();
  await page.getByRole("button", { name: "Recommencer le quiz" }).click();
  await answerQuiz(page, ANSWERS["quiz-module-1"]);
  await expect(page.getByRole("heading", { name: "Module validé" })).toBeVisible();
  await page.getByRole("link", { name: /Continuer/ }).click();

  for (const slug of ["budget", "erreurs", "plan-30-jours"]) {
    await expect(page).toHaveURL(new RegExp(`/${slug}$`));
    if (slug === "plan-30-jours") {
      const res = await page.request.get(
        await page
          .getByRole("link", { name: /Plan d’action 30 jours/ })
          .getAttribute("href")
          .then((h) => h!),
        { maxRedirects: 5 },
      );
      expect(res.headers()["content-type"]).toContain("application/pdf");
    }
    await page.getByRole("button", { name: /Marquer comme terminée/ }).click();
  }
  await expect(page).toHaveURL(/quiz-module-2$/);
  await answerQuiz(page, ANSWERS["quiz-module-2"]);
  await expect(page.getByText("Formation terminée")).toBeVisible();
  await page.getByRole("button", { name: "Obtenir mon attestation de suivi" }).click();
  // The certificate route answers with a PDF download.
  await page.goto("/compte");
  const link = page.getByRole("link", { name: /Attestation de suivi · Les bases du e-commerce/ });
  await expect(link).toBeVisible();
  const pdf = await page.request.get((await link.getAttribute("href"))!);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  await expect(page.getByText("Formation terminée")).toBeVisible();
});

test("progress is resumed from the dashboard", async ({ page }) => {
  const email = uniqueEmail("resume");
  await createMember(email);
  await signIn(page, email, `/formations/${FREE}`);
  await page.getByRole("button", { name: "Commencer gratuitement" }).click();
  await page.getByRole("button", { name: /Marquer comme terminée/ }).click();
  await expect(page).toHaveURL(/\/modeles$/);
  await page.goto("/compte");
  await page.getByRole("link", { name: /Reprendre/ }).click();
  await expect(page).toHaveURL(/\/modeles$/);
  await expect(
    page.getByRole("link", { name: /Panorama du e-commerce en France \(terminé\)/ }).first(),
  ).toBeAttached();
});

test("another member's certificate is not accessible", async ({ page }) => {
  const email = uniqueEmail("cert");
  await createMember(email);
  await signIn(page, email);
  const res = await page.request.get(
    "/api/formations/attestation/00000000-0000-4000-8000-000000000000",
  );
  expect(res.status()).toBe(404);
});

for (const path of [
  "/formations",
  `/formations/${FREE}`,
  `/apprendre/${PAID}/criteres-bon-produit`,
]) {
  test(`a11y ${path}`, async ({ page }) => {
    await page.goto(path);
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual(
      [],
    );
  });
}

test("a11y quiz", async ({ page }) => {
  const email = uniqueEmail("a11yquiz");
  await createMember(email);
  await signIn(page, email, `/formations/${FREE}`);
  await page.getByRole("button", { name: "Commencer gratuitement" }).click();
  await page.goto(`/apprendre/${FREE}/quiz-module-1`);
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});
