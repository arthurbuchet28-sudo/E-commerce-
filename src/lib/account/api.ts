import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { isSameOrigin } from "@/lib/security/origin";
import { getUser } from "@/lib/supabase/server";

type Handler = (ctx: {
  supabase: NonNullable<Awaited<ReturnType<typeof getUser>>["supabase"]>;
  userId: string;
  email: string | undefined;
  createdAt: string;
}) => Promise<Response>;

const noStore = { "Cache-Control": "no-store" };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

/** Runs a member API handler: same-origin check for mutations, authenticated user required. */
export async function withMember(request: NextRequest, handler: Handler): Promise<Response> {
  if (request.method !== "GET" && !isSameOrigin(request)) return json({ error: "forbidden" }, 403);
  const { supabase, user } = await getUser();
  if (!supabase) return json({ error: "unavailable" }, 503);
  if (!user) return json({ error: "unauthenticated" }, 401);
  return handler({ supabase, userId: user.id, email: user.email, createdAt: user.created_at });
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
