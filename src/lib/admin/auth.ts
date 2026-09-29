import "server-only";

import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/server";

/**
 * Back-office guard for pages and actions. Anonymous visitors go to the login page;
 * signed-in members who are not admins get a 404 (the back-office is not advertised).
 * Writes are also enforced by RLS (public.is_admin()), so this is not the only barrier.
 */
export async function requireAdmin(next: string = "/admin") {
  const { supabase, user } = await getUser();
  if (!supabase) notFound();
  if (!user) redirect(`/compte/connexion?next=${encodeURIComponent(next)}` as Route);
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) notFound();
  return { supabase, user };
}

/** Same check for route handlers, without redirects. */
export async function adminOrNull() {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin === true ? { supabase, user } : null;
}
