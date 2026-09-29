import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { publicEnv } from "@/lib/env";

import { fontSans, fontSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${fontSerif.variable} ${fontSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
