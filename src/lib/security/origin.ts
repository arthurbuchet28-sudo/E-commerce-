import type { NextRequest } from "next/server";

/**
 * CSRF defence for cookie-authenticated mutations: the request must come from our own
 * origin (Origin header, or Sec-Fetch-Site when Origin is absent).
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origin === request.nextUrl.origin;
  return request.headers.get("sec-fetch-site") === "same-origin";
}
