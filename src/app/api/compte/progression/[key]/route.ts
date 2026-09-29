import type { NextRequest } from "next/server";

import { json, readJson, withMember } from "@/lib/account/api";
import {
  PROGRESS_KEYS,
  progressBodySchema,
  progressDataSchemas,
  type ProgressKey,
} from "@/lib/account/schemas";

type Ctx = { params: Promise<{ key: string }> };

function parseKey(key: string): ProgressKey | null {
  return (PROGRESS_KEYS as readonly string[]).includes(key) ? (key as ProgressKey) : null;
}

export async function GET(request: NextRequest, { params }: Ctx) {
  const key = parseKey((await params).key);
  if (!key) return json({ error: "not_found" }, 404);
  return withMember(request, async ({ supabase, userId }) => {
    const { data, error } = await supabase
      .from("user_progress")
      .select("data, client_updated_at")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    if (error) return json({ error: "server_error" }, 500);
    return json(data ? { data: data.data, clientUpdatedAt: data.client_updated_at } : null);
  });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const key = parseKey((await params).key);
  if (!key) return json({ error: "not_found" }, 404);
  return withMember(request, async ({ supabase, userId }) => {
    const body = progressBodySchema.safeParse(await readJson(request));
    const data = body.success ? progressDataSchemas[key].safeParse(body.data.data) : null;
    if (!body.success || !data?.success) return json({ error: "invalid" }, 400);
    const { error } = await supabase.from("user_progress").upsert({
      user_id: userId,
      key,
      data: data.data,
      client_updated_at: body.data.clientUpdatedAt,
    });
    if (error) return json({ error: "server_error" }, 500);
    return json({ ok: true });
  });
}
