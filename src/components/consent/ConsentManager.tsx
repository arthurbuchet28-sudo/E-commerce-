"use client";

import dynamic from "next/dynamic";

import {
  allChoices,
  CONSENT_PURPOSES,
  CONSENT_VERSION,
  decide,
  needsChoice,
} from "@/lib/consent/consent";
import { currentOrNewRecord, saveConsent, useConsentRecord } from "@/lib/consent/store";

// Loaded only when a choice is needed (never in v1): keeps it off every page's bundle.
const ConsentBannerView = dynamic(() =>
  import("./ConsentBannerView").then((m) => m.ConsentBannerView),
);

/**
 * Shows the banner only when a purpose requires consent and no valid choice exists.
 * `validityMonths` comes from reference.ts through the (server) layout, keeping it off the bundle.
 */
export function ConsentManager({ validityMonths }: { validityMonths: number }) {
  const record = useConsentRecord();
  if (record === undefined) return null;
  if (!needsChoice(record, CONSENT_PURPOSES, CONSENT_VERSION, validityMonths)) return null;
  const save = (choices: Record<string, boolean>) =>
    saveConsent(decide(currentOrNewRecord(), choices, CONSENT_PURPOSES, CONSENT_VERSION), true);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <ConsentBannerView
        purposes={CONSENT_PURPOSES}
        onAcceptAll={() => save(allChoices(CONSENT_PURPOSES, true))}
        onRejectAll={() => save(allChoices(CONSENT_PURPOSES, false))}
        onSave={save}
      />
    </div>
  );
}
