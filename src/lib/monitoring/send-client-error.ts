/**
 * Browser side: reports an error caught by an error page. Errors with a digest come from the
 * server and are already reported there (instrumentation.ts), so they are skipped.
 */
export function sendClientError(error: Error & { digest?: string }) {
  if (error.digest) return;
  try {
    void fetch("/api/erreurs", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: error.name,
        message: String(error.message).slice(0, 2000),
        path: window.location.pathname,
      }),
    }).catch(() => undefined);
  } catch {
    // Reporting must never break the error page.
  }
}
