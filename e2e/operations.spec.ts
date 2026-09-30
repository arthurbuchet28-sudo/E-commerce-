import { expect, test } from "@playwright/test";

import { supabaseAvailable } from "./helpers/supabase";

test.beforeEach(({ isMobile }) => test.skip(isMobile, "desktop only"));

test("the status page and health check report the platform state", async ({ page, request }) => {
  test.skip(!(await supabaseAvailable()), "local Supabase is not running");
  // Local: no secret, the daily job can be triggered by hand.
  expect((await request.get("/api/cron/quotidien")).ok()).toBe(true);

  const health = await request.get("/api/sante");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });

  await page.goto("/statut");
  await expect(page.getByRole("status")).toHaveText("Tous les services fonctionnent normalement.");
  const rows = page.getByRole("listitem").filter({ hasText: "Tâche quotidienne" });
  await expect(rows).toContainText("Opérationnel · Dernière exécution il y a moins d’une heure");
  await expect(page.getByRole("listitem").filter({ hasText: "Paiements" })).toContainText("Simulé");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("browser error reports are accepted only from the site, small and well-formed", async ({
  request,
  baseURL,
}) => {
  const report = { name: "TypeError", message: "x is undefined", path: "/outils?x=1" };
  const post = (data: unknown, origin = baseURL!) =>
    request.post("/api/erreurs", { data, headers: { Origin: origin } });

  expect((await post(report)).status()).toBe(204);
  expect((await post(report, "https://pirate.example")).status()).toBe(403);
  expect((await post({ message: 42 })).status()).toBe(400);
  expect((await post({ ...report, message: "x".repeat(5000) })).status()).toBe(413);
});
