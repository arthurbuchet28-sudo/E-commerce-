"use client";

import { useState } from "react";

import { SelectField } from "@/components/ui/Field";
import {
  levelLabel,
  platforms,
  profiles,
  type PlatformKind,
  type ProfileId,
} from "@/data/platforms";

const kinds: Record<PlatformKind | "all", string> = {
  all: "Boutiques et marketplaces",
  boutique: "Boutiques en ligne",
  marketplace: "Marketplaces",
};

/** Tool 5 — platform comparison, filterable by kind and profile. Native table (GEO friendly). */
export function PlatformComparator() {
  const [kind, setKind] = useState<PlatformKind | "all">("all");
  const [profile, setProfile] = useState<ProfileId | "all">("all");
  const rows = platforms.filter(
    (p) =>
      (kind === "all" || p.kind === kind) && (profile === "all" || p.profiles.includes(profile)),
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        className="grid gap-4 rounded-ui border border-line bg-sheet p-4 md:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filtres du comparateur"
      >
        <SelectField
          id="type-plateforme"
          label="Type de solution"
          value={kind}
          onChange={(e) => setKind(e.target.value as PlatformKind | "all")}
        >
          {Object.entries(kinds).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="profil"
          label="Mon profil"
          value={profile}
          onChange={(e) => setProfile(e.target.value as ProfileId | "all")}
        >
          <option value="all">Tous les profils</option>
          {Object.entries(profiles).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </SelectField>
      </form>
      <p className="text-small text-muted" aria-live="polite">
        {rows.length} solution{rows.length > 1 ? "s" : ""} affichée{rows.length > 1 ? "s" : ""}
      </p>
      <ul className="flex flex-col gap-4 md:hidden">
        {rows.map((p) => (
          <li key={p.id}>
            <article className="rounded-ui border border-line bg-sheet p-5">
              <h2 className="text-h3">{p.name}</h2>
              <p className="mb-3 text-small text-muted">
                {p.kind === "boutique" ? "Boutique en ligne" : "Marketplace"} · {p.model}
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-small">
                <dt className="text-muted">Difficulté</dt>
                <dd>{levelLabel[p.difficulty]}</dd>
                <dt className="text-muted">Personnalisation</dt>
                <dd>{levelLabel[p.customization]}</dd>
                <dt className="text-muted">SEO</dt>
                <dd>{levelLabel[p.seo]}</dd>
                <dt className="text-muted">Hébergement</dt>
                <dd>{p.hosting}</dd>
                <dt className="text-muted">Extensions</dt>
                <dd>{p.extensions}</dd>
                <dt className="text-muted">Coûts</dt>
                <dd>
                  {p.costs}{" "}
                  <a href={p.pricingUrl} className="link" rel="noopener">
                    Site officiel<span className="sr-only"> de {p.name}</span>
                  </a>
                </dd>
                <dt className="text-muted">Adapté à</dt>
                <dd>{p.profiles.map((id) => profiles[id]).join(" ; ")}</dd>
              </dl>
              <p className="mt-3 text-small text-muted">{p.note}</p>
            </article>
          </li>
        ))}
      </ul>
      <div
        role="region"
        aria-label="Tableau comparatif des plateformes"
        tabIndex={0}
        className="hidden overflow-x-auto rounded-ui border border-line bg-sheet md:block"
      >
        <table className="w-full min-w-[64rem] border-collapse text-left text-small">
          <caption className="sr-only">Comparatif des plateformes de vente en ligne</caption>
          <thead>
            <tr className="border-b-2 border-ink">
              {[
                "Solution",
                "Modèle",
                "Coûts",
                "Difficulté",
                "Personnalisation",
                "SEO",
                "Extensions",
                "Hébergement",
                "Adapté à",
              ].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 align-bottom">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line align-top last:border-0">
                <th scope="row" className="px-3 py-3">
                  <span className="font-semibold">{p.name}</span>
                  <span className="block font-normal text-muted">
                    {p.kind === "boutique" ? "Boutique" : "Marketplace"}
                  </span>
                </th>
                <td className="px-3 py-3">{p.model}</td>
                <td className="px-3 py-3">
                  {p.costs}{" "}
                  <a href={p.pricingUrl} className="link whitespace-nowrap" rel="noopener">
                    Site officiel<span className="sr-only"> de {p.name}</span>
                  </a>
                </td>
                <td className="px-3 py-3">{levelLabel[p.difficulty]}</td>
                <td className="px-3 py-3">{levelLabel[p.customization]}</td>
                <td className="px-3 py-3">{levelLabel[p.seo]}</td>
                <td className="px-3 py-3">{p.extensions}</td>
                <td className="px-3 py-3">{p.hosting}</td>
                <td className="px-3 py-3">
                  <ul className="flex flex-col gap-1">
                    {p.profiles.map((id) => (
                      <li key={id}>{profiles[id]}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-muted">{p.note}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
