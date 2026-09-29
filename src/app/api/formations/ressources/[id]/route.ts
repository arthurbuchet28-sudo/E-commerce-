import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

/**
 * Course resource download. The member's own client reads the resource row (RLS: only with
 * access to the course); the private file is then served through a 60-second signed URL.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse("Ressource introuvable", { status: 404 });
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.redirect(new URL("/compte/connexion", request.url));
  const { data: resource } = await supabase
    .from("lesson_resources")
    .select("storage_path")
    .eq("id", id.data)
    .maybeSingle();
  if (!resource) return new NextResponse("Ressource introuvable", { status: 404 });
  const admin = createAdminClient();
  const signed = await admin?.storage
    .from("ressources")
    .createSignedUrl(resource.storage_path, 60, { download: true });
  if (!signed?.data?.signedUrl) return new NextResponse("Ressource indisponible", { status: 503 });
  return NextResponse.redirect(signed.data.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
