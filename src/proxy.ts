import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { buildCsp, usesStrictCsp } from "@/lib/security/csp";

const SESSION_PREFIXES = ["/compte", "/auth", "/api/compte", "/apprendre", "/admin", "/api/admin"];

/**
 * 1. Strict nonce-based CSP on private pages (Next.js reads the nonce from the request's
 *    Content-Security-Policy header and applies it to its scripts). Public pages keep the static
 *    policy set in next.config.ts, so they stay prerendered.
 * 2. Refreshes the Supabase session cookies on member routes only, so that public pages never
 *    set any cookie (no consent needed). Authorization itself is checked in each page/handler.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  let csp: string | undefined;
  if (usesStrictCsp(pathname)) {
    csp = buildCsp({
      nonce: Buffer.from(crypto.randomUUID()).toString("base64"),
      isDev: process.env.NODE_ENV === "development",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      matomoUrl: process.env.NEXT_PUBLIC_MATOMO_URL,
    });
    requestHeaders.set("Content-Security-Policy", csp);
  }
  const next = () => {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    if (csp) res.headers.set("Content-Security-Policy", csp);
    return res;
  };
  let response = next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const needsSession = SESSION_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!url || !key || !needsSession) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) {
          request.cookies.set(name, value);
          requestHeaders.set("cookie", request.cookies.toString());
        }
        response = next();
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });
  // Touching the session refreshes an expired access token.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    "/compte/:path*",
    "/auth/:path*",
    "/api/compte/:path*",
    "/apprendre/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/panier/:path*",
    "/commande/:path*",
    "/paiement-simule/:path*",
  ],
};
