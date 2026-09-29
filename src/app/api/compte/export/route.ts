import type { NextRequest } from "next/server";

import { json, withMember } from "@/lib/account/api";
import { createAdminClient } from "@/lib/supabase/admin";

/** RGPD right of access and portability: every piece of data stored about the member. */
export async function GET(request: NextRequest) {
  return withMember(request, async ({ supabase, userId, email, createdAt }) => {
    const [profile, progress, simulations, ...learning] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, cgu_accepted_at, cgu_version, created_at, updated_at")
        .eq("id", userId)
        .single(),
      supabase.from("user_progress").select("key, data, client_updated_at, updated_at"),
      supabase
        .from("saved_simulations")
        .select("tool, title, inputs, created_at")
        .order("created_at"),
      supabase
        .from("enrollments")
        .select("source, created_at, starts_at, expires_at, revoked_at, courses(slug, title)"),
      supabase.from("lesson_progress").select("completed_at, last_seen_at, lessons(slug, title)"),
      supabase.from("quiz_attempts").select("score, passed, answers, created_at, modules(title)"),
      supabase.from("certificates").select("serial, holder_name, issued_at, courses(title)"),
      supabase
        .from("orders")
        .select(
          "reference, email, customer_name, status, amount_cents, currency, cgv_version, cgv_accepted_at, immediate_access, waiver_at, waiver_text_version, created_at, paid_at, order_items(title, unit_price_cents), invoices(number, kind, issued_at), withdrawals(requested_at, refund_status, refunded_at)",
        ),
      supabase.from("consent_log").select("kind, text_version, created_at"),
    ]);
    if (profile.error || progress.error || simulations.error || learning.some((r) => r.error))
      return json({ error: "server_error" }, 500);
    const [enrollments, lessonProgress, quizAttempts, certificates, orders, consents] = learning;
    // Newsletter subscribers are not members (service role only): matched by the verified e-mail.
    const newsletter = email
      ? await createAdminClient()
          ?.from("newsletter_subscribers")
          .select(
            "email, status, source, consent_text_version, requested_at, confirmed_at, unsubscribed_at",
          )
          .eq("email", email.toLowerCase())
          .maybeSingle()
      : null;

    const body = {
      exportedAt: new Date().toISOString(),
      account: { email, createdAt },
      profile: profile.data,
      progress: progress.data,
      simulations: simulations.data,
      courses: {
        enrollments: enrollments.data,
        lessonProgress: lessonProgress.data,
        quizAttempts: quizAttempts.data,
        certificates: certificates.data,
      },
      orders: orders.data,
      consents: consents.data,
      newsletter: newsletter?.data ?? null,
    };
    return new Response(JSON.stringify(body, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="premiere-vente-mes-donnees.json"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
