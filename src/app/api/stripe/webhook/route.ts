import { processStripeWebhook } from "@/lib/commerce/server";

/**
 * Stripe webhook: signature checked on the raw body, events processed once
 * (checkout.session.completed / expired, charge.refunded). Not behind the proxy.
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const { status, body } = await processStripeWebhook(
    payload,
    request.headers.get("stripe-signature"),
  );
  return Response.json(body, { status });
}
