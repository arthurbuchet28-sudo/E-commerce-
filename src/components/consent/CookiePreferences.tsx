"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { CONSENT_PURPOSES, CONSENT_VERSION, decide } from "@/lib/consent/consent";
import { currentOrNewRecord, saveConsent, useConsentRecord } from "@/lib/consent/store";

/**
 * Preference centre (« Gérer mes cookies »): withdrawing is as easy as giving consent.
 * Also holds the opposition to the consent-exempt audience measurement.
 */
export function CookiePreferences() {
  const record = useConsentRecord();
  const [saved, setSaved] = useState(false);
  if (record === undefined) {
    return <p className="text-muted">Chargement de vos préférences…</p>;
  }
  return (
    <form
      id="preferences"
      className="flex scroll-mt-24 flex-col gap-4 rounded-ui border border-line bg-sheet p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const base = { ...currentOrNewRecord(), audienceOptOut: form.get("audience") === "on" };
        const choices = Object.fromEntries(
          CONSENT_PURPOSES.map((p) => [p.id, form.get(p.id) === "on"]),
        );
        const next = CONSENT_PURPOSES.length
          ? decide(base, choices, CONSENT_PURPOSES, CONSENT_VERSION)
          : base;
        saveConsent(next, CONSENT_PURPOSES.length > 0);
        setSaved(true);
      }}
      onChange={() => setSaved(false)}
    >
      <h2 className="text-h3">Mes préférences</h2>
      {CONSENT_PURPOSES.length === 0 ? (
        <p>
          Aucun traceur soumis à votre consentement n’est utilisé sur ce site : il n’y a rien à
          accepter ni à refuser.
        </p>
      ) : (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-semibold">Traceurs soumis à votre accord</legend>
          {CONSENT_PURPOSES.map((p) => (
            <Checkbox
              key={p.id}
              id={`preference-${p.id}`}
              name={p.id}
              label={p.label}
              hint={`${p.description} Partenaires : ${p.vendors.join(", ")}.`}
              defaultChecked={record?.choices[p.id] === true}
            />
          ))}
        </fieldset>
      )}
      <Checkbox
        id="preference-audience"
        name="audience"
        label="Ne pas être compté dans les statistiques de fréquentation"
        hint="La mesure d’audience est anonyme et sans cookie ; vous pouvez tout de même vous y opposer. Ce choix est mémorisé sur cet appareil."
        defaultChecked={record?.audienceOptOut === true}
      />
      <div>
        <Button type="submit">Enregistrer mes préférences</Button>
      </div>
      <p role="status" className="text-small font-semibold text-sage">
        {saved ? "Vos préférences sont enregistrées." : ""}
      </p>
    </form>
  );
}
