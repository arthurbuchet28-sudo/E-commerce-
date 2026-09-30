import type { NextConfig } from "next";

import { buildCsp, STRICT_CSP_PREFIXES } from "./src/lib/security/csp";

// Baseline security headers on every response. The CSP is split (see src/lib/security/csp.ts):
// static policy here for prerendered pages, strict nonce policy from src/proxy.ts elsewhere.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const staticCsp = buildCsp({
  isDev: process.env.NODE_ENV === "development",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  matomoUrl: process.env.NEXT_PUBLIC_MATOMO_URL,
});
// Every path except the strict prefixes (they get their own header from the proxy).
const nonStrictPaths = `/((?!${STRICT_CSP_PREFIXES.map((p) => p.slice(1)).join("|")}).*)`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    // Back-office PDF uploads (resources): 4 MB files, under Vercel's 4.5 MB request cap.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      { source: nonStrictPaths, headers: [{ key: "Content-Security-Policy", value: staticCsp }] },
    ];
  },
};

export default nextConfig;
