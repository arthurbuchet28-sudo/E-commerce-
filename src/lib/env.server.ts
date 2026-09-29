import "server-only";

import { parseServerEnv, type ServerEnv } from "./env";

let cached: ServerEnv | undefined;

/** Server-side environment, validated once (at startup via instrumentation.ts). */
export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
