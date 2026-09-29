"use client";

import {
  allChoices,
  CONSENT_PURPOSES,
  CONSENT_VERSION,
  decide,
  needsChoice,
} from "@/lib/consent/consent";
import { getRef } from "@/data/reference";
import { currentOrNewRecord, saveConsent, useConsentRecord } from "@/lib/consent/store";

import { ConsentBannerView } from "./ConsentBannerView";

const VALIDITY = getRef("cnil.dureeChoixCookies").value as number;

/** Shows the banner only when a purpose requires consent and no valid choice exists. */
export function ConsentManager() {
  const record = useConsentRecord();
  if (record === undefined) return null;
  if (!needsChoice(record, CONSENT_PURPOSES, CONSENT_VERSION, VALIDITY)) return null;
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
