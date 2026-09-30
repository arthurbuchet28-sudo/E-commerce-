import type { Metadata } from "next";
import { preload } from "react-dom";

import { AccountSync } from "@/components/account/AccountSync";
import { Analytics } from "@/components/consent/Analytics";
import { ConsentManager } from "@/components/consent/ConsentManager";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { siteConfig } from "@/config/site";
import { getRef } from "@/data/reference";
import { publicEnv } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${siteConfig.name} · Se lancer dans le e-commerce`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  applicationName: siteConfig.name,
  openGraph: { siteName: siteConfig.name, locale: "fr_FR", type: "website" },
  formatDetection: { telephone: false },
};

/** Regular faces only: they render the first screen. Italics are fetched on demand. */
const PRELOADED_FONTS = [
  "/fonts/literata-latin-wght-normal.woff2",
  "/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  for (const href of PRELOADED_FONTS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <SiteHeader />
        <main id="contenu" tabIndex={-1} className="flex-1 pb-16 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <AccountSync />
        <ConsentManager validityMonths={getRef("cnil.dureeChoixCookies").value as number} />
        <Analytics
          url={publicEnv.NEXT_PUBLIC_MATOMO_URL}
          siteId={publicEnv.NEXT_PUBLIC_MATOMO_SITE_ID}
        />
      </body>
    </html>
  );
}
