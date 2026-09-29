import type { NextRequest } from "next/server";

import { json, readJson, withMember } from "@/lib/account/api";
import { simulationBodySchema } from "@/lib/account/schemas";

export async function GET(request: NextRequest) {
  return withMember(request, async ({ supabase }) => {
    const { data, error } = await supabase
      .from("saved_simulations")
      .select("id, tool, title, inputs, created_at")
      .order("created_at", { ascending: false });
    if (error) return json({ error: "server_error" }, 500);
    return json(data);
  });
}

export async function POST(request: NextRequest) {
  return withMember(request, async ({ supabase, userId }) => {
    const body = simulationBodySchema.safeParse(await readJson(request));
    if (!body.success)
      return json({ error: "invalid", message: body.error.issues[0]?.message }, 400);
    const { data, error } = await supabase
      .from("saved_simulations")
      .insert({ user_id: userId, ...body.data })
      .select("id")
      .single();
    if (error) {
      if (error.message.includes("simulation_limit_reached")) return json({ error: "limit" }, 409);
      return json({ error: "server_error" }, 500);
    }
    return json({ id: data.id }, 201);
  });
}
