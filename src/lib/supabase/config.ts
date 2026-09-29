import { publicEnv } from "@/lib/env";

/** Member features are disabled (with a clear message) when Supabase is not configured. */
export function supabaseConfig(): { url: string; key: string } | null {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}
