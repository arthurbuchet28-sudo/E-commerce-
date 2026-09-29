import { parseServerEnv } from "@/lib/env";

/** Runs once when the server starts: fail fast on invalid configuration. */
export function register() {
  parseServerEnv(process.env);
}
