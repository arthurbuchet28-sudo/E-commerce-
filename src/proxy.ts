import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookies on member routes only, so that public pages never
 * set any cookie (no consent needed). Authorization itself is checked in each page/handler.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
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
  ],
};
