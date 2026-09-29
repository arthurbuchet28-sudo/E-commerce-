import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseConfig } from "./config";
import type { Database } from "./database.types";

/**
 * Anonymous client without cookies, for public data (published catalogue). Keeps catalogue
 * pages static (ISR) instead of making them dynamic per visitor.
 */
export function createPublicClient() {
  const config = supabaseConfig();
  if (!config) return null;
  return createClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
