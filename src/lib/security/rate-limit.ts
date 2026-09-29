import "server-only";

import { createHash } from "node:crypto";

import { headers } from "next/headers";

import type { createAdminClient } from "@/lib/supabase/admin";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/** Visitor IP (first X-Forwarded-For hop on Vercel), only ever used hashed. */
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window limits (public.rate_limit), per visitor and per visitor + e-mail.
 * Keys are hashes: neither IP addresses nor e-mails are stored in clear.
 */
export async function withinRateLimit(
  admin: Admin,
  scope: string,
  email: string,
  limits: { perEmail: number; perVisitor: number; windowSeconds: number },
): Promise<boolean> {
  const ip = await clientIp();
  const checks = [
    { key: `${scope}:${hash(`${ip}|${email.trim().toLowerCase()}`)}`, max: limits.perEmail },
    { key: `${scope}:${hash(ip)}`, max: limits.perVisitor },
  ];
  for (const { key, max } of checks) {
    const { data } = await admin.rpc("rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: limits.windowSeconds,
    });
    if (data === false) return false;
  }
  return true;
}
