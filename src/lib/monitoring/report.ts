import "server-only";

import type { ServerEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

import { scrubEvent, scrubPath, scrubText } from "./scrub";

/**
 * Error monitoring (Sentry, EU region), server side only: the browser SDK would add ~30 KB of
 * JavaScript to every page (phase 14 budget). Client errors reach Sentry through
 * /api/erreurs. Without SENTRY_DSN (local), errors are only logged.
 */

export type ErrorContext = {
  source: "server" | "client";
  path?: string;
  digest?: string;
  method?: string;
  routeType?: string;
};

type SentryModule = typeof import("@sentry/nextjs");

/**
 * Sentry once initialised. Next.js bundles instrumentation.ts and each route separately, so
 * module state is not shared: the SDK's own global client is the source of truth.
 */
async function sentryClient(
  env: Pick<ServerEnv, "SENTRY_DSN" | "APP_ENV">,
): Promise<SentryModule | null> {
  if (!env.SENTRY_DSN) return null;
  const mod = await import("@sentry/nextjs");
  if (mod.getClient()) return mod;
  mod.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    // Collect nothing about the visitor; beforeSend scrubs what remains (defence in depth).
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    tracesSampleRate: 0,
    beforeBreadcrumb: () => null,
    beforeSend: (event) => scrubEvent(event),
  });
  return mod;
}

export async function initMonitoring(env: Pick<ServerEnv, "SENTRY_DSN" | "APP_ENV">) {
  await sentryClient(env);
}

export async function reportError(error: unknown, context: ErrorContext): Promise<void> {
  const tags = Object.fromEntries(
    Object.entries({ ...context, path: context.path && scrubPath(context.path) }).filter(
      ([, v]) => v !== undefined,
    ),
  );
  const sentry = await sentryClient(serverEnv());
  if (!sentry) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[erreur]", tags, scrubText(message));
    return;
  }
  sentry.captureException(error, { tags });
  // Serverless functions may freeze right after the response: send before returning.
  await sentry.flush(2000);
}
