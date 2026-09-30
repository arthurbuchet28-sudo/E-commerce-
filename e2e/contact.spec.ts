import { expect, test } from "@playwright/test";

import {
  adminRest,
  createMember,
  signIn,
  supabaseAvailable,
  uniqueEmail,
  userIdFor,
} from "./helpers/supabase";

test.beforeEach(async ({ isMobile }) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  test.skip(isMobile, "desktop only");
});

test("a visitor sends a message that admins read and mark as handled", async ({ page }) => {
  const sender = uniqueEmail("contact");
  const text = `Bonjour, une question sur le guide TVA (${Date.now()}).`;

  await page.goto("/contact");
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(page.getByText("Indiquez votre nom.")).toBeVisible();

  await page.getByLabel(/^Nom/).fill("Sophie");
  await page.getByLabel(/^Adresse e-mail/).fill(sender);
  await page.getByLabel("Sujet").selectOption("question");
  await page.getByLabel(/^Message/).fill(text);
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(page.getByText(/Merci, votre message est bien envoyé/)).toBeVisible();

  const admin = uniqueEmail("admin-contact");
  await createMember(admin, "Admin");
  await adminRest(`profiles?id=eq.${await userIdFor(admin)}`, {
    method: "PATCH",
    body: JSON.stringify({ role: "admin" }),
  });
  await signIn(page, admin, "/admin/messages");
  const message = page.getByRole("listitem").filter({ hasText: text });
  await expect(message).toContainText(sender);
  await message.getByRole("button", { name: "Marquer comme traité" }).click();
  await expect(message.getByText("traité", { exact: false })).toBeVisible();
});

test("bots filling the hidden field are silently ignored", async ({ page }) => {
  const text = `Message de robot ${Date.now()}`;
  await page.goto("/contact");
  await page.getByLabel(/^Nom/).fill("Robot");
  await page.getByLabel(/^Adresse e-mail/).fill(uniqueEmail("robot"));
  await page.getByLabel(/^Message/).fill(text);
  await page.locator('input[name="site_web"]').evaluate((el: HTMLInputElement) => {
    el.value = "https://spam.example";
  });
  await page.getByRole("button", { name: "Envoyer mon message" }).click();
  await expect(page.getByText(/Merci, votre message est bien envoyé/)).toBeVisible();
  const rows = await (
    await adminRest(`contact_messages?message=eq.${encodeURIComponent(text)}&select=id`)
  ).json();
  expect(rows).toEqual([]);
});
