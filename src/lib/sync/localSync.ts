/**
 * Browser-side helpers shared by the local stores and the account sync.
 * Each synced value lives in localStorage under `key`, with its change time under
 * `key:updatedAt` (ISO). Last write wins between the browser and the account.
 */

export const SYNCED = [
  { local: "parcours:v1", remote: "parcours", event: "parcours-change" },
  { local: "checklist-lancement:v1", remote: "checklist-lancement", event: "local-json-change" },
] as const;

export type SyncedEntry = (typeof SYNCED)[number];

export function readLocal(key: string): { raw: string | null; updatedAt: string | null } {
  try {
    return { raw: localStorage.getItem(key), updatedAt: localStorage.getItem(`${key}:updatedAt`) };
  } catch {
    return { raw: null, updatedAt: null };
  }
}

/** Writes a value and its change time. `updatedAt` defaults to now (a local change). */
export function writeLocal(key: string, raw: string | null, updatedAt = new Date().toISOString()) {
  try {
    if (raw === null) localStorage.removeItem(key);
    else localStorage.setItem(key, raw);
    localStorage.setItem(`${key}:updatedAt`, updatedAt);
  } catch {
    // storage blocked
  }
}

/** Supabase session cookies are readable by scripts: no network call for anonymous visitors. */
export function hasSessionCookie(): boolean {
  return typeof document !== "undefined" && /(?:^|;\s*)sb-[^=]+-auth-token/.test(document.cookie);
}

export type Remote = { data: unknown; clientUpdatedAt: string } | null;

/**
 * Decides what to do given both sides. Pure, unit-tested.
 * - "pull": the account is newer (or the browser is empty) → overwrite the browser.
 * - "push": the browser is newer (or the account is empty) → upload.
 * - "none": already in sync or nothing to sync.
 */
export function syncDecision(
  local: { raw: string | null; updatedAt: string | null },
  remote: Remote,
): "pull" | "push" | "none" {
  if (!remote) return local.raw !== null ? "push" : "none";
  if (local.raw === null || !local.updatedAt) return "pull";
  const l = Date.parse(local.updatedAt);
  const r = Date.parse(remote.clientUpdatedAt);
  if (r > l) return "pull";
  if (l > r) return "push";
  return "none";
}
