/**
 * Content Security Policy, in two flavours (see PLAN.md, phase 14):
 *
 * - **strict** (nonce + 'strict-dynamic') on the private, dynamically rendered routes
 *   (account, lessons, back-office, checkout): set by `src/proxy.ts`, which generates the nonce
 *   that Next.js applies to its own scripts.
 * - **static** on every other page: these pages are prerendered (SSG), so no per-request nonce
 *   exists and Next.js inlines its RSC payload in `<script>` tags. Inline scripts are therefore
 *   allowed, but script origins, frames, forms, plugins and `<base>` are all locked down.
 *
 * Kept free of path aliases: `next.config.ts` imports this file.
 */

export type CspOptions = {
  /** Per-request nonce: switches to the strict policy. */
  nonce?: string;
  isDev?: boolean;
  /** Public site URL: `upgrade-insecure-requests` only when it is served over HTTPS. */
  siteUrl?: string;
  /** Matomo instance (script, tracker and pixel). */
  matomoUrl?: string;
};

/** Routes that get the strict nonce policy (all dynamically rendered). */
export const STRICT_CSP_PREFIXES = [
  "/compte",
  "/apprendre",
  "/admin",
  "/panier",
  "/commande",
  "/paiement-simule",
] as const;

/** Bunny Stream player (lesson videos). */
export const VIDEO_FRAME_ORIGIN = "https://iframe.mediadelivery.net";
/** Stripe Checkout: without JavaScript, the checkout form POST is redirected there. */
export const CHECKOUT_ORIGIN = "https://checkout.stripe.com";

function originOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

export function usesStrictCsp(pathname: string): boolean {
  return STRICT_CSP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function buildCsp({ nonce, isDev = false, siteUrl, matomoUrl }: CspOptions = {}): string {
  const matomo = originOf(matomoUrl);
  const extra = (...values: (string | undefined | false)[]) =>
    values.filter((v): v is string => Boolean(v));

  // 'wasm-unsafe-eval': Pagefind (site search) runs on WebAssembly; it does not allow eval().
  const script = nonce
    ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'wasm-unsafe-eval'"]
    : ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'", ...extra(matomo)];
  if (isDev) script.push("'unsafe-eval'");

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": script,
    // React renders `style` attributes (progress bars): they need 'unsafe-inline'.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...extra(matomo)],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...extra(matomo)],
    "frame-src": [VIDEO_FRAME_ORIGIN],
    "media-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", CHECKOUT_ORIGIN],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (siteUrl?.startsWith("https://")) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}
