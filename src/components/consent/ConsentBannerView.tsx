"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import type { ConsentPurpose } from "@/lib/consent/consent";

/**
 * First-level choice (CNIL): « Tout accepter », « Tout refuser » and « Personnaliser » have
 * the same size and visibility; nothing is pre-checked in the detailed view.
 */
export function ConsentBannerView({
  purposes,
  onAcceptAll,
  onRejectAll,
  onSave,
}: {
  purposes: readonly ConsentPurpose[];
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSave: (choices: Record<string, boolean>) => void;
}) {
  const [detailed, setDetailed] = useState(false);
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const button = "min-w-40 flex-1 justify-center";
  return (
    <section
      aria-labelledby="consentement-titre"
      className="border-t-2 border-ink bg-sheet p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <h2 id="consentement-titre" className="text-h3">
          Vos choix sur les cookies
        </h2>
        <p>
          Avec votre accord, nous utilisons des traceurs pour :{" "}
          {purposes.map((p) => p.label.toLowerCase()).join(", ")}. Vous pouvez accepter, refuser ou
          choisir finalité par finalité, et changer d’avis à tout moment avec le lien « Gérer mes
          cookies » en bas de chaque page.{" "}
          <Link href="/cookies" className="link">
            En savoir plus
          </Link>
        </p>
        {detailed && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-semibold">Choisir par finalité</legend>
            {purposes.map((p) => (
              <Checkbox
                key={p.id}
                id={`consentement-${p.id}`}
                label={p.label}
                hint={`${p.description} Partenaires : ${p.vendors.join(", ")}.`}
                checked={choices[p.id] === true}
                onChange={(e) => setChoices({ ...choices, [p.id]: e.target.checked })}
              />
            ))}
          </fieldset>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="button" className={button} onClick={onAcceptAll}>
            Tout accepter
          </Button>
          <Button type="button" className={button} onClick={onRejectAll}>
            Tout refuser
          </Button>
          {detailed ? (
            <Button type="button" className={button} onClick={() => onSave(choices)}>
              Enregistrer mes choix
            </Button>
          ) : (
            <Button type="button" className={button} onClick={() => setDetailed(true)}>
              Personnaliser
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
