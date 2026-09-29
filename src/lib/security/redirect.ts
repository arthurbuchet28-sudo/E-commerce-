/** Only same-site paths are allowed as post-login destinations (open redirect protection). */
export function safeNext(next: unknown, fallback = "/compte"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
