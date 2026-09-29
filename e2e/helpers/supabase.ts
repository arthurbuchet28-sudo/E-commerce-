import fs from "node:fs";

import { expect, type Page } from "@playwright/test";

/** Local Supabase settings: environment first, then .env.local (never committed). */
function localEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  if (fs.existsSync(".env.local")) {
    for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m) out[m[1]] = m[2];
    }
  }
  return { ...out, ...(process.env as Record<string, string>) };
}

const env = localEnv();
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SECRET = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const MAILPIT = env.MAILPIT_URL ?? "http://127.0.0.1:54324";

export async function supabaseAvailable(): Promise<boolean> {
  if (!SUPABASE_URL) return false;
  try {
    return (await fetch(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: SECRET } })).ok;
  } catch {
    return false;
  }
}

export function uniqueEmail(tag: string) {
  return `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
}

export const PASSWORD = "Carnet2026route";

/** Creates a confirmed member through the Auth admin API (fast path for most tests). */
export async function createMember(email: string, displayName = "Léa") {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    }),
  });
  expect(res.ok, await res.clone().text()).toBe(true);
}

export async function signIn(page: Page, email: string, next = "/compte") {
  await page.goto(`/compte/connexion?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Adresse e-mail").first().fill(email);
  await page.getByLabel(/^Mot de passe/).fill(PASSWORD);
  await page.getByRole("button", { name: "Me connecter" }).click();
  await page.waitForURL((url) => url.pathname === next.split("?")[0]);
}

/** Waits for the latest e-mail sent to `to` (captured by Mailpit) and returns the auth link. */
export async function authLinkFor(to: string): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(
      async () => {
        const search = await fetch(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
        );
        const { messages } = (await search.json()) as { messages: Array<{ ID: string }> };
        if (!messages?.length) return false;
        const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${messages[0].ID}`)).json()) as {
          HTML: string;
        };
        link = /href="([^"]*\/auth\/confirm[^"]*)"/.exec(msg.HTML)?.[1]?.replaceAll("&amp;", "&");
        return Boolean(link);
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  return link!;
}

/** Waits for an e-mail sent to `to` whose subject matches, and returns its plain text. */
export async function emailFor(
  to: string,
  subject: RegExp,
): Promise<{ id: string; subject: string; text: string }> {
  let found: { id: string; subject: string; text: string } | undefined;
  await expect
    .poll(
      async () => {
        const search = await fetch(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
        );
        const { messages } = (await search.json()) as {
          messages: Array<{ ID: string; Subject: string }>;
        };
        const match = messages?.find((m) => subject.test(m.Subject));
        if (!match) return false;
        const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${match.ID}`)).json()) as {
          Text: string;
        };
        found = { id: match.ID, subject: match.Subject, text: msg.Text };
        return true;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  return found!;
}

/** Headers of a Mailpit message. */
export async function emailHeaders(id: string): Promise<Record<string, string[]>> {
  return (await (await fetch(`${MAILPIT}/api/v1/message/${id}/headers`)).json()) as Record<
    string,
    string[]
  >;
}

/** Number of e-mails received by `to` (Mailpit). */
export async function emailCount(to: string): Promise<number> {
  const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
  return ((await res.json()) as { messages_count?: number; total?: number }).messages_count ?? 0;
}

/** Service-role REST access to a table (test setup only). */
export async function adminRest(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
}
