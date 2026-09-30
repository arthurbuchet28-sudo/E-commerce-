"use client";

import { useEffect } from "react";

import { sendClientError } from "@/lib/monitoring/send-client-error";

import "./globals.css";

/** Last-resort boundary (errors in the root layout): must render its own <html>. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => sendClientError(error), [error]);
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center p-6">
        <main className="flex max-w-xl flex-col gap-4">
          <h1 className="text-h1">Le site rencontre un problème</h1>
          <p>Nous faisons le nécessaire. Réessayez dans quelques instants.</p>
          <div>
            <button
              type="button"
              onClick={() => retry()}
              className="min-h-11 rounded-ui bg-ink px-4 font-semibold text-on-ink"
            >
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
