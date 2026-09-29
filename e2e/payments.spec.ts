import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import Stripe from "stripe";

import { createMember, emailFor, signIn, supabaseAvailable, uniqueEmail } from "./helpers/supabase";

const PAID = "trouver-et-valider-son-produit";
// Built-in secret of the local payment simulation (src/lib/services/payments.ts).
const LOCAL_WEBHOOK_SECRET = "whsec_local_simulation_only";

test.beforeEach(async ({ isMobile }, testInfo) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  if (!testInfo.title.startsWith("a11y")) test.skip(isMobile, "desktop only");
});

/** Buys the paid course through the simulated checkout; returns the order reference. */
async function buy(page: Page, { immediate }: { immediate: boolean }): Promise<string> {
  await page.goto(`/formations/${PAID}`);
  await page.getByRole("link", { name: "Acheter la formation" }).click();
  await expect(page).toHaveURL(`/panier?formation=${PAID}`);
  if (immediate) await page.getByLabel(/je renonce expressément/).check();
  await page.getByLabel(/J’ai lu et j’accepte les/).check();
  await page.getByRole("button", { name: "Continuer vers le paiement sécurisé" }).click();
  await expect(page).toHaveURL(/\/paiement-simule\?session=cs_sim_/);
  await page.getByRole("button", { name: /Payer 49,00/ }).click();
  await expect(page).toHaveURL(/\/commande\/succes\?session_id=cs_sim_/);
  const reference = await page.getByText(/^PV-[A-Z0-9]{8}$/).textContent();
  return reference!;
}

test("consents are never pre-checked and the CGV are required", async ({ page }) => {
  const email = uniqueEmail("cgv");
  await createMember(email);
  await signIn(page, email, `/panier?formation=${PAID}`);
  await expect(page.getByText("49,00 € TTC")).toBeVisible();
  await expect(page.getByText("TVA non applicable, art. 293 B du CGI")).toBeVisible();
  const waiver = page.getByLabel(/je renonce expressément/);
  const cgv = page.getByLabel(/J’ai lu et j’accepte les/);
  await expect(waiver).not.toBeChecked();
  await expect(cgv).not.toBeChecked();
  await page.getByRole("button", { name: "Continuer vers le paiement sécurisé" }).click();
  await expect(
    page.getByText("Acceptez les conditions générales de vente pour continuer."),
  ).toBeVisible();
  await expect(page).toHaveURL(`/panier?formation=${PAID}`);
});

test("visitors are asked to sign in before ordering", async ({ page }) => {
  await page.goto(`/panier?formation=${PAID}`);
  await expect(page.getByText("Connectez-vous pour commander", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuer vers le paiement sécurisé" }),
  ).toHaveCount(0);
});

test("purchase with immediate access opens the course, e-mails and invoices", async ({ page }) => {
  const email = uniqueEmail("achat");
  await createMember(email, "Nadia");
  await signIn(page, email);
  const reference = await buy(page, { immediate: true });

  await expect(page.getByText("Votre accès est ouvert", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Commencer la formation" }).click();
  await expect(page).toHaveURL(new RegExp(`/apprendre/${PAID}/`));
  await expect(page.getByRole("button", { name: /Marquer comme terminée/ })).toBeVisible();

  const mail = await emailFor(email, /est confirmée/);
  expect(mail.subject).toBe(`Votre commande ${reference} est confirmée`);
  expect(mail.text).toContain("Bonjour Nadia,");
  expect(mail.text).toMatch(/Montant payé\s:\s49,00/);
  expect(mail.text).toContain("je renonce expressément à mon droit de rétractation");
  expect(mail.text).toContain("TVA non applicable, art. 293 B du CGI");

  await page.goto("/compte");
  const purchases = page.getByRole("region", { name: "Mes achats et factures" });
  await expect(purchases.getByText(`Commande ${reference}`)).toBeVisible();
  const download = page.waitForEvent("download");
  await purchases.getByRole("link", { name: /^Facture F\d{4}-\d{5}/ }).click();
  expect((await download).suggestedFilename()).toMatch(/^facture-F\d{4}-\d{5}\.pdf$/);

  // Buying twice is impossible.
  await page.goto(`/panier?formation=${PAID}`);
  await expect(page.getByText("Vous avez déjà accès à cette formation.")).toBeVisible();
});

test("without the waiver, access is deferred and the online withdrawal refunds", async ({
  page,
}) => {
  const email = uniqueEmail("retractation");
  await createMember(email, "Élise");
  await signIn(page, email);
  const reference = await buy(page, { immediate: false });
  await expect(page.getByText("Votre accès ouvrira bientôt", { exact: true })).toBeVisible();
  await page.goto(`/apprendre/${PAID}/sources-idees`);
  await expect(page).toHaveURL(`/formations/${PAID}`);
  const mail = await emailFor(email, /est confirmée/);
  expect(mail.text).toContain("Votre accès ouvrira le");

  // Withdrawal without being signed in.
  await page.context().clearCookies();
  await page.goto("/retractation");
  await page.getByLabel(/Nom et prénom/).fill("Élise Martin");
  await page.getByLabel(/Adresse e-mail utilisée/).fill(email.toUpperCase());
  await page.getByLabel(/Numéro de commande/).fill(reference.toLowerCase().replace("pv-", "pv "));
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("heading", { name: /Étape 2 sur 2/ })).toBeFocused();
  await expect(page.getByText(reference)).toBeVisible();
  await page.getByRole("button", { name: "Confirmer la rétractation" }).click();
  await expect(page.getByRole("heading", { name: "Rétractation enregistrée" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    `Un accusé de réception vient d’être envoyé à ${email}`,
  );

  const ack = await emailFor(email, /Accusé de réception de votre rétractation/);
  expect(ack.text).toMatch(new RegExp(`Commande\\s:\\s${reference}`));
  expect(ack.text).toMatch(/Remboursement\s:\s49,00/);

  await signIn(page, email);
  const purchases = page.getByRole("region", { name: "Mes achats et factures" });
  await expect(purchases.getByText(/Rétractée/)).toBeVisible();
  await expect(purchases.getByRole("link", { name: /^Avoir AV\d{4}-\d{5}/ })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Mes formations" }).getByText(/Trouver et valider/),
  ).toHaveCount(0);
});

test("withdrawal is refused once a course bought with the waiver is started", async ({ page }) => {
  const email = uniqueEmail("renonciation");
  await createMember(email);
  await signIn(page, email);
  const reference = await buy(page, { immediate: true });
  await page.getByRole("link", { name: "Commencer la formation" }).click();
  await expect(page).toHaveURL(new RegExp(`/apprendre/${PAID}/`));

  await page.goto("/retractation");
  await page.getByLabel(/Nom et prénom/).fill("Léa");
  await page.getByLabel(/Adresse e-mail utilisée/).fill(email);
  await page.getByLabel(/Numéro de commande/).fill(reference);
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByText("Rétractation impossible", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirmer la rétractation" })).toHaveCount(0);
});

test("unknown orders are not disclosed", async ({ page }) => {
  await page.goto("/retractation");
  await page.getByLabel(/Nom et prénom/).fill("Léa");
  await page.getByLabel(/Adresse e-mail utilisée/).fill("personne@example.test");
  await page.getByLabel(/Numéro de commande/).fill("PV-AAAAAAAA");
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Aucune commande ne correspond" }),
  ).toBeVisible();
});

test("the webhook refuses unsigned and forged events and ignores replays", async ({ request }) => {
  const payload = JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_e2e_unknown",
        object: "checkout.session",
        payment_status: "paid",
        amount_total: 4900,
        currency: "eur",
        payment_intent: "pi_e2e",
      },
    },
  });
  const headers = { "content-type": "application/json" };
  expect((await request.post("/api/stripe/webhook", { data: payload, headers })).status()).toBe(
    400,
  );
  const forged = await request.post("/api/stripe/webhook", {
    data: payload,
    headers: { ...headers, "stripe-signature": "t=1,v1=deadbeef" },
  });
  expect(forged.status()).toBe(400);

  const signature = new Stripe("sk_test_unused").webhooks.generateTestHeaderString({
    payload,
    secret: LOCAL_WEBHOOK_SECRET,
  });
  const signed = { ...headers, "stripe-signature": signature };
  const first = await request.post("/api/stripe/webhook", { data: payload, headers: signed });
  expect(first.status()).toBe(200);
  expect(await first.json()).toMatchObject({ received: true, result: "unknown_order" });
  const replay = await request.post("/api/stripe/webhook", { data: payload, headers: signed });
  expect(await replay.json()).toMatchObject({ received: true, result: "duplicate" });
});

test("a11y: cart and withdrawal confirmation have no serious violations", async ({ page }) => {
  const email = uniqueEmail("a11y-achat");
  await createMember(email);
  await signIn(page, email, `/panier?formation=${PAID}`);
  const check = async () => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  };
  await check();
  const reference = await buy(page, { immediate: false });
  await check();
  await page.goto("/retractation");
  await page.getByLabel(/Nom et prénom/).fill("Léa");
  await page.getByLabel(/Adresse e-mail utilisée/).fill(email);
  await page.getByLabel(/Numéro de commande/).fill(reference);
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("button", { name: "Confirmer la rétractation" })).toBeVisible();
  await check();
});
