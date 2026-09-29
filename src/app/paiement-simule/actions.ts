"use server";

import { randomUUID } from "node:crypto";

import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { processStripeWebhook } from "@/lib/commerce/server";
import { isSimulation, stripe, webhookSecret } from "@/lib/services/payments";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Local payment simulation: builds the event Stripe would send, signs it with the webhook
 * secret and runs it through the real webhook handler (signature, idempotency, access).
 */
export async function simulatePayment(formData: FormData) {
  if (!isSimulation()) notFound();
  const sessionId = z
    .string()
    .regex(/^cs_sim_[0-9a-f]{32}$/)
    .parse(formData.get("session"));
  const admin = createAdminClient();
  const secret = webhookSecret();
  if (!admin || !secret) notFound();
  const { data: order } = await admin
    .from("orders")
    .select("amount_cents, currency, status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (!order) notFound();

  const payload = JSON.stringify({
    id: `evt_sim_${randomUUID().replaceAll("-", "")}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_status: "paid",
        amount_total: order.amount_cents,
        currency: order.currency,
        payment_intent: `pi_sim_${randomUUID().replaceAll("-", "")}`,
      },
    },
  });
  const signature = stripe().webhooks.generateTestHeaderString({ payload, secret });
  const result = await processStripeWebhook(payload, signature);
  if (result.status !== 200) throw new Error(`Simulated webhook failed: ${result.body.error}`);
  redirect(`/commande/succes?session_id=${sessionId}` as Route);
}
