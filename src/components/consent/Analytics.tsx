"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useConsentRecord } from "@/lib/consent/store";

type Paq = Array<unknown[]>;
declare global {
  interface Window {
    _paq?: Paq;
  }
}

/**
 * Matomo in the CNIL consent-exempt configuration: no cookie (disableCookies), audience
 * measurement only, opposition honoured. Loaded only when configured.
 * [À VÉRIFIER — réglages côté Matomo : anonymisation de l’IP, durée de conservation]
 */
export function Analytics({ url, siteId }: { url?: string; siteId?: string }) {
  const record = useConsentRecord();
  const pathname = usePathname();
  const enabled = Boolean(url && siteId) && record !== undefined && !record?.audienceOptOut;

  useEffect(() => {
    if (!enabled || !url || !siteId) return;
    const base = url.endsWith("/") ? url : `${url}/`;
    const paq = (window._paq ??= []);
    if (!document.getElementById("matomo-script")) {
      paq.push(["disableCookies"]);
      paq.push(["setTrackerUrl", `${base}matomo.php`]);
      paq.push(["setSiteId", siteId]);
      const script = document.createElement("script");
      script.id = "matomo-script";
      script.async = true;
      script.src = `${base}matomo.js`;
      document.head.appendChild(script);
    }
  }, [enabled, url, siteId]);

  useEffect(() => {
    if (!enabled) return;
    window._paq?.push(["setCustomUrl", window.location.pathname]);
    window._paq?.push(["setDocumentTitle", document.title]);
    window._paq?.push(["trackPageView"]);
  }, [enabled, pathname]);

  useEffect(() => {
    // Opposition after loading: stop tracking right away (Matomo opt-out API).
    if (record?.audienceOptOut) window._paq?.push(["optUserOut"]);
  }, [record?.audienceOptOut]);

  return null;
}
