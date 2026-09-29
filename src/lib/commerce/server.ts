import "server-only";

import { publicEnv } from "@/lib/env";
import { emailProvider } from "@/lib/services/email";
import { stripe, webhookSecret } from "@/lib/services/payments";
import { createAdminClient } from "@/lib/supabase/admin";

import { sellerSnapshot } from "./seller";
import { handleStripeWebhook, type WebhookResponse } from "./webhook";

/** Wires the webhook handler to Stripe, the service-role client and the e-mail provider. */
export async function processStripeWebhook(
  payload: string,
  signature: string | null,
): Promise<WebhookResponse> {
  const admin = createAdminClient();
  if (!admin) return { status: 503, body: { received: false, error: "database_unavailable" } };
  return handleStripeWebhook(payload, signature, {
    constructEvent: (p, s, secret) => stripe().webhooks.constructEvent(p, s, secret),
    secret: webhookSecret(),
    rpc: (fn, args) => admin.rpc(fn, args as never),
    sendEmail: (m) => emailProvider().send(m),
    seller: sellerSnapshot(),
    siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
  });
}
