import "server-only";

import { serverEnv } from "@/lib/env.server";

/**
 * Mailing-list mirror (Brevo contact list) for future campaigns. The database stays the
 * source of truth for consent; the mirror is best-effort and optional.
 */
export interface AudienceProvider {
  readonly name: "none" | "brevo";
  add(email: string): Promise<void>;
  remove(email: string): Promise<void>;
}

type Fetch = typeof fetch;

export const noAudienceProvider: AudienceProvider = {
  name: "none",
  async add() {},
  async remove() {},
};

/** [À VÉRIFIER — documentation API Brevo « Contacts »] endpoints and payloads. */
export function brevoAudienceProvider(apiKey: string, listId: number, fetchFn: Fetch = fetch) {
  const call = async (path: string, body: unknown) => {
    const res = await fetchFn(`https://api.brevo.com/v3${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Brevo contacts failed: ${res.status}`);
  };
  return {
    name: "brevo",
    add: (email) => call("/contacts", { email, listIds: [listId], updateEnabled: true }),
    remove: (email) => call(`/contacts/lists/${listId}/contacts/remove`, { emails: [email] }),
  } satisfies AudienceProvider;
}

export function audienceProvider(): AudienceProvider {
  const env = serverEnv();
  const listId = Number(env.BREVO_NEWSLETTER_LIST_ID);
  if (
    env.EMAIL_PROVIDER === "brevo" &&
    env.BREVO_API_KEY &&
    Number.isInteger(listId) &&
    listId > 0
  ) {
    return brevoAudienceProvider(env.BREVO_API_KEY, listId);
  }
  return noAudienceProvider;
}
