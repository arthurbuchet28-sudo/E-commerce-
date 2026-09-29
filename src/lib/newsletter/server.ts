import "server-only";

import { createHash, randomBytes } from "node:crypto";

import {
  CONFIRMATION_TTL_HOURS,
  NEWSLETTER_CONSENT_VERSION,
  NEWSLETTER_RETENTION,
  welcomeSequence,
} from "@/data/newsletter";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import { audienceProvider } from "@/lib/services/audience";
import { emailProvider } from "@/lib/services/email";
import { createAdminClient } from "@/lib/supabase/admin";

import { confirmationEmail, sequenceEmail, type SequenceUrls } from "./emails";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newsletterUrls(accessToken: string): SequenceUrls {
  const site = publicEnv.NEXT_PUBLIC_SITE_URL;
  return {
    siteUrl: site,
    unsubscribeUrl: `${site}/api/newsletter/desinscription?token=${accessToken}`,
    checklistUrl: `${site}/api/newsletter/checklist?token=${accessToken}`,
  };
}

const DAY = 86_400_000;

function nextDueAt(afterStep: number, from = Date.now()): string | null {
  const next = welcomeSequence[afterStep];
  return next ? new Date(from + next.delayDays * DAY).toISOString() : null;
}

/** Starts (or restarts) the double opt-in. Silent for already confirmed addresses. */
export async function requestSubscription(admin: Admin, email: string, source: string) {
  const token = randomBytes(32).toString("base64url");
  const { data, error } = await admin.rpc("newsletter_request", {
    p_email: email,
    p_source: source,
    p_consent_version: NEWSLETTER_CONSENT_VERSION,
    p_token_hash: hashToken(token),
    p_ttl_hours: CONFIRMATION_TTL_HOURS,
  });
  if (error) throw new Error(error.message);
  if ((data as { action: string }).action !== "send_confirmation") return;
  const url = `${publicEnv.NEXT_PUBLIC_SITE_URL}/newsletter/confirmer?token=${token}`;
  await emailProvider().send(confirmationEmail(email.trim().toLowerCase(), url));
}

export type ConfirmResult =
  { status: "confirmed"; checklistUrl: string } | { status: "invalid" | "expired" };

/** Confirms the subscription, then sends e-mail 1 of the sequence (the checklist). */
export async function confirmSubscription(admin: Admin, token: string): Promise<ConfirmResult> {
  const { data, error } = await admin.rpc("newsletter_confirm", { p_token_hash: hashToken(token) });
  if (error) throw new Error(error.message);
  const result = data as {
    status: "confirmed" | "invalid" | "expired";
    id: string;
    email: string;
    accessToken: string;
  };
  if (result.status !== "confirmed") return { status: result.status };

  const urls = newsletterUrls(result.accessToken);
  try {
    await audienceProvider().add(result.email);
  } catch (e) {
    console.error(`[newsletter] audience sync failed: ${(e as Error).message}`);
  }
  try {
    await emailProvider().send(sequenceEmail(result.email, welcomeSequence[0], urls));
    await admin.rpc("newsletter_advance", {
      p_id: result.id,
      p_step: 1,
      p_next_at: nextDueAt(1) as string,
    });
  } catch (e) {
    // The scheduled job retries e-mail 1 (next_email_at is still due).
    console.error(`[newsletter] welcome e-mail failed: ${(e as Error).message}`);
  }
  return { status: "confirmed", checklistUrl: urls.checklistUrl };
}

export async function unsubscribe(admin: Admin, accessToken: string): Promise<boolean> {
  if (!/^[0-9a-f]{48}$/.test(accessToken)) return false;
  const { data, error } = await admin.rpc("newsletter_unsubscribe", {
    p_access_token: accessToken,
  });
  if (error) throw new Error(error.message);
  if (!data) return false;
  try {
    await audienceProvider().remove(data);
  } catch (e) {
    console.error(`[newsletter] audience removal failed: ${(e as Error).message}`);
  }
  return true;
}

/**
 * Scheduled job: sends the due e-mails of the welcome sequence, then applies retention.
 * Drafts ([À VALIDER]) are never sent in production: they wait, and go out once validated.
 */
export async function runNewsletterJob(admin: Admin) {
  const production = serverEnv().APP_ENV === "production";
  const { data: due, error } = await admin.rpc("newsletter_claim_due", {
    p_max_step: welcomeSequence.length,
    p_limit: 200,
  });
  if (error) throw new Error(error.message);
  let sent = 0;
  let held = 0;
  let failed = 0;
  for (const s of due ?? []) {
    const email = welcomeSequence[s.sequence_step];
    if (production && email.draft) {
      held++;
      await admin.rpc("newsletter_advance", {
        p_id: s.id,
        p_step: s.sequence_step,
        p_next_at: new Date(Date.now() + DAY).toISOString(),
      });
      continue;
    }
    try {
      await emailProvider().send(sequenceEmail(s.email, email, newsletterUrls(s.access_token)));
      await admin.rpc("newsletter_advance", {
        p_id: s.id,
        p_step: email.step,
        p_next_at: nextDueAt(email.step) as string,
      });
      sent++;
    } catch (e) {
      failed++;
      console.error(`[newsletter] sequence e-mail failed: ${(e as Error).message}`);
    }
  }
  const { data: purged } = await admin.rpc("newsletter_purge", {
    p_pending_days: NEWSLETTER_RETENTION.pendingDays,
    p_unsubscribed_days: NEWSLETTER_RETENTION.unsubscribedDays,
  });
  return { sent, held, failed, purged };
}
