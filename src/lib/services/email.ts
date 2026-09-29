import "server-only";

import { siteConfig } from "@/config/site";
import { serverEnv } from "@/lib/env.server";

/** A transactional e-mail. `text` is always sent: it is the durable, accessible version. */
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailProvider {
  readonly name: "console" | "mailpit" | "brevo";
  send(message: EmailMessage): Promise<void>;
}

type Fetch = typeof fetch;

/** Local development: the e-mail is printed in the server terminal. */
export const consoleEmailProvider: EmailProvider = {
  name: "console",
  async send(message) {
    console.info(`[email] to=${message.to} subject=${message.subject}\n${message.text}`);
  },
};

/** Local development and e2e tests: the e-mail appears in Mailpit (started by `supabase start`). */
export function mailpitEmailProvider(baseUrl: string, from: string, fetchFn: Fetch = fetch) {
  return {
    name: "mailpit",
    async send(message) {
      const res = await fetchFn(new URL("/api/v1/send", baseUrl), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          From: { Email: from, Name: siteConfig.name },
          To: [{ Email: message.to }],
          Subject: message.subject,
          Text: message.text,
          HTML: message.html,
        }),
      });
      if (!res.ok) throw new Error(`Mailpit send failed: ${res.status}`);
    },
  } satisfies EmailProvider;
}

/** Production: Brevo transactional API (EU). */
export function brevoEmailProvider(apiKey: string, from: string, fetchFn: Fetch = fetch) {
  return {
    name: "brevo",
    async send(message) {
      const res = await fetchFn("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { email: from, name: siteConfig.name },
          to: [{ email: message.to }],
          subject: message.subject,
          textContent: message.text,
          htmlContent: message.html,
        }),
      });
      if (!res.ok) throw new Error(`Brevo send failed: ${res.status}`);
    },
  } satisfies EmailProvider;
}

export function emailProvider(): EmailProvider {
  const env = serverEnv();
  if (env.EMAIL_PROVIDER === "brevo" && env.BREVO_API_KEY) {
    return brevoEmailProvider(env.BREVO_API_KEY, env.EMAIL_FROM);
  }
  if (env.EMAIL_PROVIDER === "mailpit")
    return mailpitEmailProvider(env.MAILPIT_URL, env.EMAIL_FROM);
  return consoleEmailProvider;
}
