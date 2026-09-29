"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  hasSessionCookie,
  readLocal,
  SYNCED,
  syncDecision,
  writeLocal,
  type Remote,
  type SyncedEntry,
} from "@/lib/sync/localSync";

const PUSH_DELAY = 800;

async function pull(entry: SyncedEntry): Promise<Remote | undefined> {
  const res = await fetch(`/api/compte/progression/${entry.remote}`, { cache: "no-store" });
  if (!res.ok) return undefined; // 401: not signed in; other errors: try again next visit
  return (await res.json()) as Remote;
}

async function push(entry: SyncedEntry) {
  const { raw, updatedAt } = readLocal(entry.local);
  if (raw === null || !updatedAt) return;
  await fetch(`/api/compte/progression/${entry.remote}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: JSON.parse(raw), clientUpdatedAt: updatedAt }),
  });
}

/**
 * Keeps the path progress and the launch checklist in sync with the member account.
 * Mounted once in the root layout; does nothing (no request) for anonymous visitors.
 */
export function AccountSync() {
  const pathname = usePathname();
  // Sync once per session: re-checked on navigation, since signing in happens without reload.
  const syncedSession = useRef(false);

  useEffect(() => {
    if (!hasSessionCookie()) {
      syncedSession.current = false;
      return;
    }
    const firstSync = !syncedSession.current;
    syncedSession.current = true;
    let cancelled = false;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const syncing = new Set<string>();

    async function initial(entry: SyncedEntry) {
      syncing.add(entry.local);
      try {
        const remote = await pull(entry);
        if (cancelled || remote === undefined) return;
        const decision = syncDecision(readLocal(entry.local), remote);
        if (decision === "pull" && remote) {
          writeLocal(entry.local, JSON.stringify(remote.data), remote.clientUpdatedAt);
          window.dispatchEvent(new Event(entry.event));
        } else if (decision === "push") {
          await push(entry);
        }
      } catch {
        // offline: local progress stays, sync resumes on next page load
      } finally {
        syncing.delete(entry.local);
      }
    }

    const listeners = SYNCED.map((entry) => {
      const onChange = () => {
        if (syncing.has(entry.local)) return; // change caused by a pull
        clearTimeout(timers.get(entry.local));
        timers.set(
          entry.local,
          setTimeout(() => void push(entry).catch(() => undefined), PUSH_DELAY),
        );
      };
      window.addEventListener(entry.event, onChange);
      return () => window.removeEventListener(entry.event, onChange);
    });

    if (firstSync) for (const entry of SYNCED) void initial(entry);
    return () => {
      cancelled = true;
      listeners.forEach((off) => off());
      timers.forEach((t) => clearTimeout(t));
    };
  }, [pathname]);
  return null;
}
