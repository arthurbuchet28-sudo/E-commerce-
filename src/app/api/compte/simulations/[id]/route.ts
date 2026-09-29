import type { NextRequest } from "next/server";
import { z } from "zod";

import { json, withMember } from "@/lib/account/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) return json({ error: "not_found" }, 404);
  return withMember(request, async ({ supabase }) => {
    // RLS restricts the deletion to the member's own rows.
    const { error, count } = await supabase
      .from("saved_simulations")
      .delete({ count: "exact" })
      .eq("id", id.data);
    if (error) return json({ error: "server_error" }, 500);
    return count ? json({ ok: true }) : json({ error: "not_found" }, 404);
  });
}
