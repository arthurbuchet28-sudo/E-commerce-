import "server-only";

import { randomUUID } from "node:crypto";

import Stripe from "stripe";

import { serverEnv } from "@/lib/env.server";

/**
 * Payments behind an interface: Stripe Checkout in test/production, a local simulation
 * without any account. Both paths go through the same signed webhook (see
 * src/lib/commerce/webhook.ts): access is never granted anywhere else.
 */
export type CheckoutRequest = {
  orderId: string;
  reference: string;
  email: string;
  lines: Array<{ title: string; amountCents: number }>;
  successUrl: string;
  cancelUrl: string;
};

export type RefundResult = { id: string; status: "succeeded" | "pending" | "failed" };

export interface PaymentProvider {
  readonly name: "stripe" | "simulation";
  createCheckout(request: CheckoutRequest): Promise<{ id: string; url: string }>;
  refund(paymentIntentId: string, idempotencyKey: string): Promise<RefundResult>;
}

/**
 * Signs simulated webhooks when STRIPE_WEBHOOK_SECRET is empty. Local only: production
 * requires the Stripe keys (src/lib/env.ts), so the simulation can never run there.
 */
export const LOCAL_WEBHOOK_SECRET = "whsec_local_simulation_only";

/** Checkout sessions stay open 30 minutes (Stripe minimum). */
const CHECKOUT_TTL_SECONDS = 30 * 60;

export function stripePaymentProvider(stripe: Stripe): PaymentProvider {
  return {
    name: "stripe",
    async createCheckout(req) {
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          locale: "fr",
          customer_email: req.email,
          client_reference_id: req.orderId,
          line_items: req.lines.map((l) => ({
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: l.amountCents,
              product_data: { name: l.title },
            },
          })),
          metadata: { order_id: req.orderId, reference: req.reference },
          payment_intent_data: { metadata: { order_id: req.orderId, reference: req.reference } },
          success_url: req.successUrl,
          cancel_url: req.cancelUrl,
          expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS,
        },
        { idempotencyKey: `checkout-${req.orderId}` },
      );
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      return { id: session.id, url: session.url };
    },
    async refund(paymentIntentId, idempotencyKey) {
      const refund = await stripe.refunds.create(
        { payment_intent: paymentIntentId },
        { idempotencyKey },
      );
      const status =
        refund.status === "succeeded"
          ? "succeeded"
          : refund.status === "failed"
            ? "failed"
            : "pending";
      return { id: refund.id, status };
    },
  };
}

/**
 * Local simulation: the « payment page » is /paiement-simule, which derives its success and
 * cancel links from the order (no URL taken from the query string). Refunds always succeed.
 */
export function simulatedPaymentProvider(): PaymentProvider {
  return {
    name: "simulation",
    async createCheckout() {
      const id = `cs_sim_${randomUUID().replaceAll("-", "")}`;
      return { id, url: `/paiement-simule?session=${id}` };
    },
    async refund() {
      return { id: `re_sim_${randomUUID().replaceAll("-", "")}`, status: "succeeded" };
    },
  };
}

let stripeClient: Stripe | undefined;

/** Stripe SDK instance; webhook signature checks work without an API key. */
export function stripe(): Stripe {
  stripeClient ??= new Stripe(serverEnv().STRIPE_SECRET_KEY ?? "sk_simulation_no_api_calls");
  return stripeClient;
}

export function paymentProvider(): PaymentProvider {
  return serverEnv().STRIPE_SECRET_KEY
    ? stripePaymentProvider(stripe())
    : simulatedPaymentProvider();
}

export function isSimulation(): boolean {
  const env = serverEnv();
  return !env.STRIPE_SECRET_KEY && env.APP_ENV !== "production";
}

/**
 * Secret used to verify webhook signatures. The public local secret is accepted only in
 * simulation mode (no Stripe key, not production); otherwise a missing secret refuses all.
 */
export function webhookSecret(): string | null {
  const env = serverEnv();
  if (env.STRIPE_WEBHOOK_SECRET) return env.STRIPE_WEBHOOK_SECRET;
  return isSimulation() ? LOCAL_WEBHOOK_SECRET : null;
}
