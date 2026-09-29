import type Stripe from "stripe";

import { withdrawalDays } from "@/config/legal";
import type { EmailMessage } from "@/lib/services/email";

import { orderConfirmationEmail, type OrderConfirmation } from "./emails";
import type { SellerSnapshot } from "./seller";

/**
 * Stripe webhook processing, independent of Next.js so it can be unit-tested and reused
 * by the local payment simulation. The ONLY place where paid access is granted.
 */

type RpcResult = { data: unknown; error: { message: string } | null };

export type WebhookDeps = {
  constructEvent: (payload: string, signature: string, secret: string) => Stripe.Event;
  secret: string | null;
  rpc: (
    fn: "fulfill_order" | "expire_order" | "record_refund",
    args: Record<string, unknown>,
  ) => PromiseLike<RpcResult>;
  sendEmail: (message: EmailMessage) => Promise<void>;
  seller: SellerSnapshot;
  siteUrl: string;
  log?: (message: string) => void;
};

export type WebhookResponse = {
  status: number;
  body: { received: boolean; result?: string; error?: string };
};

type FulfillResult = { status: string } & Partial<Omit<OrderConfirmation, "vatMention">>;

function paymentIntentId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function handleStripeWebhook(
  payload: string,
  signature: string | null,
  deps: WebhookDeps,
): Promise<WebhookResponse> {
  const log = deps.log ?? console.error;
  if (!signature || !deps.secret) {
    return { status: 400, body: { received: false, error: "missing_signature" } };
  }
  let event: Stripe.Event;
  try {
    event = deps.constructEvent(payload, signature, deps.secret);
  } catch {
    return { status: 400, body: { received: false, error: "invalid_signature" } };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Card payments are confirmed synchronously; anything else is not sold here.
      if (session.payment_status !== "paid")
        return { status: 200, body: { received: true, result: "unpaid" } };
      const { data, error } = await deps.rpc("fulfill_order", {
        p_event_id: event.id,
        p_session_id: session.id,
        p_payment_intent: paymentIntentId(session.payment_intent),
        p_amount_cents: session.amount_total ?? 0,
        p_currency: session.currency ?? "",
        p_withdrawal_days: withdrawalDays(),
        p_seller: deps.seller,
      });
      // A 500 makes Stripe retry later; the event id is only stored on success.
      if (error) {
        log(`[stripe] fulfill_order failed: ${error.message}`);
        return { status: 500, body: { received: false, error: "fulfill_failed" } };
      }
      const result = data as FulfillResult;
      if (result.status === "amount_mismatch" || result.status === "unknown_order") {
        log(`[stripe] ${result.status} for session ${session.id}`);
      }
      if (result.status === "fulfilled") {
        try {
          await deps.sendEmail(
            orderConfirmationEmail(
              {
                ...(result as Omit<OrderConfirmation, "vatMention">),
                vatMention: deps.seller.vatMention,
              },
              deps.siteUrl,
            ),
          );
        } catch (e) {
          // Access is already granted: never make Stripe retry for an e-mail failure.
          log(`[stripe] confirmation e-mail failed: ${(e as Error).message}`);
        }
      }
      return { status: 200, body: { received: true, result: result.status } };
    }
    case "checkout.session.expired": {
      const { data, error } = await deps.rpc("expire_order", {
        p_event_id: event.id,
        p_session_id: event.data.object.id,
      });
      if (error) return { status: 500, body: { received: false, error: "expire_failed" } };
      return { status: 200, body: { received: true, result: (data as { status: string }).status } };
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const intent = paymentIntentId(charge.payment_intent);
      if (!intent) return { status: 200, body: { received: true, result: "ignored" } };
      const { data, error } = await deps.rpc("record_refund", {
        p_event_id: event.id,
        p_payment_intent: intent,
        p_amount_refunded: charge.amount_refunded,
        p_refund_id: charge.refunds?.data[0]?.id ?? null,
        p_seller: deps.seller,
      });
      if (error) return { status: 500, body: { received: false, error: "refund_failed" } };
      return { status: 200, body: { received: true, result: (data as { status: string }).status } };
    }
    default:
      return { status: 200, body: { received: true, result: "ignored" } };
  }
}
