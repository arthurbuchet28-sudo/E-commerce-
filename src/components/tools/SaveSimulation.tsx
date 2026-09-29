"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import type { SavedTool } from "@/lib/account/schemas";
import { hasSessionCookie } from "@/lib/sync/localSync";

const noop = () => () => {};

/** « Enregistrer ma simulation » for signed-in members; an invitation to sign in otherwise. */
export function SaveSimulation({
  tool,
  inputs,
  defaultTitle,
}: {
  tool: SavedTool;
  inputs: Record<string, string>;
  defaultTitle: string;
}) {
  const signedIn = useSyncExternalStore(noop, hasSessionCookie, () => false);
  const pathname = usePathname();
  const [title, setTitle] = useState(defaultTitle);
  const [status, setStatus] = useState<{
    kind: "idle" | "busy" | "ok" | "error";
    message?: string;
  }>({ kind: "idle" });

  if (!signedIn) {
    return (
      <p className="text-small text-muted">
        <Link
          href={`/compte/connexion?next=${encodeURIComponent(pathname)}` as Route}
          className="link"
        >
          Connectez-vous
        </Link>{" "}
        pour enregistrer vos simulations et les retrouver dans votre compte.
      </p>
    );
  }

  async function save() {
    setStatus({ kind: "busy" });
    const res = await fetch("/api/compte/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, title, inputs }),
    }).catch(() => null);
    if (res?.ok)
      return setStatus({
        kind: "ok",
        message: "Simulation enregistrée. Retrouvez-la dans votre compte.",
      });
    const body = res
      ? ((await res.json().catch(() => ({}))) as { error?: string; message?: string })
      : {};
    const message =
      res?.status === 401
        ? "Votre session a expiré : reconnectez-vous pour enregistrer."
        : body.error === "limit"
          ? "Vous avez atteint 50 simulations : supprimez-en une depuis votre compte."
          : (body.message ?? "L’enregistrement a échoué. Vérifiez votre connexion puis réessayez.");
    setStatus({ kind: "error", message });
  }

  return (
    <div className="flex flex-col gap-3 rounded-ui border border-line bg-sheet p-5">
      <TextField
        id={`titre-${tool}`}
        label="Nom de la simulation"
        value={title}
        maxLength={80}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={save}
          disabled={status.kind === "busy" || title.trim() === ""}
          variant="secondary"
        >
          {status.kind === "busy" ? "Enregistrement…" : "Enregistrer ma simulation"}
        </Button>
        {status.kind === "ok" && (
          <Link href="/compte" className="link text-small">
            Voir mon compte
          </Link>
        )}
      </div>
      <p
        aria-live="polite"
        className={
          status.kind === "error" ? "text-small font-semibold text-danger" : "text-small text-muted"
        }
      >
        {status.message}
      </p>
    </div>
  );
}
