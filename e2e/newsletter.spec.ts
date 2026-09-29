import { expect, test, type Page } from "@playwright/test";

import {
  adminRest,
  createMember,
  emailCount,
  emailFor,
  emailHeaders,
  signIn,
  supabaseAvailable,
  uniqueEmail,
} from "./helpers/supabase";

test.beforeEach(async ({ isMobile }) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  test.skip(isMobile, "desktop only");
});

const CONSENT = /J’accepte de recevoir la newsletter/;
const SENT = /ouvrez l’e-mail que nous venons de vous envoyer/;

async function subscribe(page: Page, email: string) {
  await page.goto("/ressources");
  await page.getByLabel(/Adresse e-mail/).fill(email);
  await page.getByLabel(CONSENT).check();
  await page.getByRole("button", { name: "Recevoir la checklist" }).click();
  await expect(page.getByText(SENT)).toBeVisible();
}

/** Extracts the first URL containing `part` from an e-mail text. */
function urlIn(text: string, part: string): string {
  const url = text.match(/https?:\/\/\S+/g)?.find((u) => u.includes(part));
  expect(url, part).toBeTruthy();
  return new URL(url!).pathname + new URL(url!).search;
}

test("double opt-in: consent required, confirmation by click, checklist delivered", async ({
  page,
}) => {
  const email = uniqueEmail("newsletter");
  await page.goto("/ressources");
  const consent = page.getByLabel(CONSENT);
  await expect(consent).not.toBeChecked();
  await page.getByLabel(/Adresse e-mail/).fill(email);
  await page.getByRole("button", { name: "Recevoir la checklist" }).click();
  await expect(page.getByText("Cochez la case pour confirmer votre accord.")).toBeVisible();
  await consent.check();
  await page.getByRole("button", { name: "Recevoir la checklist" }).click();
  await expect(page.getByText(SENT)).toBeVisible();

  const confirmation = await emailFor(email, /Confirmez votre inscription/);
  // Opening the link does not confirm: an explicit click is required.
  await page.goto(urlIn(confirmation.text, "/newsletter/confirmer"));
  expect(await emailCount(email)).toBe(1);
  await page.getByRole("button", { name: "Confirmer mon inscription" }).click();
  await expect(page.getByText("Votre inscription est confirmée.", { exact: false })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Télécharger la checklist (PDF)" }).click();
  expect((await download).suggestedFilename()).toBe("checklist-25-points-avant-ouverture.pdf");

  const welcome = await emailFor(email, /Votre checklist/);
  expect(welcome.text).toContain("/api/newsletter/checklist?token=");
  const headers = await emailHeaders(welcome.id);
  expect(headers["List-Unsubscribe"]?.[0]).toMatch(
    /^<https?:\/\/.+\/api\/newsletter\/desinscription\?token=[0-9a-f]{48}>$/,
  );
  expect(headers["List-Unsubscribe-Post"]).toEqual(["List-Unsubscribe=One-Click"]);

  // The link cannot be used twice.
  await page.goto(urlIn(confirmation.text, "/newsletter/confirmer"));
  await expect(page.getByText("Lien invalide ou expiré", { exact: true })).toBeVisible();

  // Signing up again does not reveal that the address is already subscribed.
  await subscribe(page, email);
});

test("welcome sequence goes out on schedule and one click unsubscribes", async ({
  page,
  request,
}) => {
  const email = uniqueEmail("sequence");
  await subscribe(page, email);
  const confirmation = await emailFor(email, /Confirmez votre inscription/);
  await page.goto(urlIn(confirmation.text, "/newsletter/confirmer"));
  await page.getByRole("button", { name: "Confirmer mon inscription" }).click();
  const welcome = await emailFor(email, /Votre checklist/);

  // Time travel: e-mail 2 becomes due, then the daily job runs.
  const past = new Date(Date.now() - 60_000).toISOString();
  await adminRest(`newsletter_subscribers?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify({ next_email_at: past }),
  });
  const job = await request.get("/api/cron/newsletter");
  expect(job.status()).toBe(200);
  expect((await job.json()).sent).toBeGreaterThanOrEqual(1);
  const second = await emailFor(email, /Par où commencer/);
  expect(second.text).toContain("/se-lancer");

  // Footer link: one click, no confirmation step.
  await page.goto(urlIn(welcome.text, "/api/newsletter/desinscription"));
  await expect(page).toHaveURL(/\/newsletter\/desinscription\?statut=ok$/);
  await expect(page.getByText("Vous êtes désinscrit")).toBeVisible();
  const rows = await (
    await adminRest(
      `newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=status,next_email_at`,
    )
  ).json();
  expect(rows).toEqual([{ status: "unsubscribed", next_email_at: null }]);

  // RFC 8058 POST from the mail client is accepted too (idempotent).
  const post = await request.post(urlIn(welcome.text, "/api/newsletter/desinscription"), {
    form: { "List-Unsubscribe": "One-Click" },
  });
  expect(post.status()).toBe(200);
});

test("bots filling the hidden field get no e-mail", async ({ page }) => {
  const email = uniqueEmail("bot");
  await page.goto("/ressources");
  await page.getByLabel(/Adresse e-mail/).fill(email);
  await page.getByLabel(CONSENT).check();
  await page.locator('input[name="site_web"]').evaluate((el: HTMLInputElement) => {
    el.value = "https://spam.example";
  });
  await page.getByRole("button", { name: "Recevoir la checklist" }).click();
  await expect(page.getByText(SENT)).toBeVisible();
  await page.waitForTimeout(1000);
  expect(await emailCount(email)).toBe(0);
});

test("invalid newsletter links are rejected", async ({ request }) => {
  const checklist = await request.get("/api/newsletter/checklist?token=" + "0".repeat(48));
  expect(checklist.status()).toBe(404);
  const unsubscribe = await request.get("/api/newsletter/desinscription?token=nope", {
    maxRedirects: 0,
  });
  expect(unsubscribe.headers().location).toContain("statut=inconnu");
});

test("members manage the newsletter from their account", async ({ page }) => {
  const email = uniqueEmail("compte-newsletter");
  await createMember(email);
  await signIn(page, email);
  const panel = page.getByRole("region", { name: "Mes préférences e-mail" });
  await expect(panel.getByLabel(/Adresse e-mail/)).toHaveValue(email);
  await panel.getByLabel(CONSENT).check();
  await panel.getByRole("button", { name: "M’inscrire à la newsletter" }).click();
  await expect(panel.getByText(SENT)).toBeVisible();
  const confirmation = await emailFor(email, /Confirmez votre inscription/);
  await page.goto(urlIn(confirmation.text, "/newsletter/confirmer"));
  await page.getByRole("button", { name: "Confirmer mon inscription" }).click();
  await expect(page.getByText("Votre inscription est confirmée.", { exact: false })).toBeVisible();

  await page.goto("/compte");
  await expect(panel.getByText(/Vous êtes inscrit à la newsletter depuis le/)).toBeVisible();
  await panel.getByRole("button", { name: "Me désinscrire de la newsletter" }).click();
  await expect(panel.getByRole("button", { name: "M’inscrire à la newsletter" })).toBeVisible();
});
