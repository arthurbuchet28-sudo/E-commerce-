import type { NextRequest } from "next/server";

import { json, withMember } from "@/lib/account/api";

/** RGPD right of access and portability: every piece of data stored about the member. */
export async function GET(request: NextRequest) {
  return withMember(request, async ({ supabase, userId, email, createdAt }) => {
    const [profile, progress, simulations] = await Promise.all([
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
    ]);
    if (profile.error || progress.error || simulations.error)
      return json({ error: "server_error" }, 500);

    const body = {
      exportedAt: new Date().toISOString(),
      account: { email, createdAt },
      profile: profile.data,
      progress: progress.data,
      simulations: simulations.data,
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
