import type { Instrumentation } from "next";

import { parseServerEnv } from "@/lib/env";

/** Runs once when the server starts: fail fast on invalid configuration, start monitoring. */
export async function register() {
  const env = parseServerEnv(process.env);
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initMonitoring } = await import("@/lib/monitoring/report");
    await initMonitoring(env);
  }
}

/** Server errors (rendering, route handlers, server actions, proxy). */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportError } = await import("@/lib/monitoring/report");
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;
  await reportError(error, {
    source: "server",
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    digest,
  });
};
