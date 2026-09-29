"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Container } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Reported to Sentry once monitoring is wired (phase 15).
    console.error(error);
  }, [error]);

  return (
    <Container className="flex max-w-3xl flex-col gap-6 py-16">
      <h1 className="text-h1">Une erreur est survenue</h1>
      <p className="text-lead text-muted">
        La page n’a pas pu s’afficher. Réessayez dans un instant ; si le problème persiste,
        signalez-le-nous depuis la page contact.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => retry()}>Réessayer</Button>
        <Link href="/se-lancer" className="link">
          Revenir au parcours « Se lancer »
        </Link>
        <Link href="/contact" className="link">
          Signaler le problème
        </Link>
      </div>
      {error.digest && (
        <p className="text-small text-muted">Référence de l’erreur : {error.digest}</p>
      )}
    </Container>
  );
}
