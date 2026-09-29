"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 2000;
const MAX_TRIES = 15;

/** Re-renders the page while the webhook confirms the payment (usually a few seconds). */
export function AwaitConfirmation() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= MAX_TRIES) return;
    const id = setTimeout(() => {
      router.refresh();
      setTries((t) => t + 1);
    }, INTERVAL_MS);
    return () => clearTimeout(id);
  }, [router, tries]);

  return (
    <p role="status" className="text-muted">
      {tries < MAX_TRIES
        ? "Confirmation du paiement en cours…"
        : "La confirmation prend plus de temps que prévu. Vous recevrez un e-mail dès qu’elle sera faite ; vous pouvez aussi recharger la page."}
    </p>
  );
}
