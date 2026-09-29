import type { MDXComponents } from "mdx/types";

import { CookiePreferences } from "@/components/consent/CookiePreferences";
import { CGU_VERSION, CGV_VERSION } from "@/config/legal";
import { siteConfig } from "@/config/site";
import { essentialStorage, processors, treatments } from "@/data/privacy";
import { CONSENT_PURPOSES } from "@/lib/consent/consent";

/**
 * Values injected into legal templates: <Info cle="editeur.nom" />. Only these keys exist;
 * an unknown key fails the build (no silent blank in a legal page).
 */
const p = siteConfig.publisher;
export const legalInfo: Record<string, string> = {
  "site.nom": siteConfig.name,
  "site.domaine": siteConfig.domain,
  "editeur.nom": p.legalName,
  "editeur.forme": p.legalForm,
  "editeur.siret": p.siret,
  "editeur.adresse": p.address,
  "editeur.email": p.email,
  "editeur.directeur": p.publicationDirector,
  "editeur.tva": p.vatNumber ?? "Non applicable : franchise en base de TVA",
  "hebergeur.nom": siteConfig.hosting.name,
  "hebergeur.adresse": siteConfig.hosting.address,
  "hebergeur.telephone": siteConfig.hosting.phone,
  "hebergeur.region": siteConfig.hosting.region,
  "mediateur.nom": siteConfig.mediator.name,
  "mediateur.site": siteConfig.mediator.url,
  "contact.donnees": siteConfig.privacyContact,
  "contact.accessibilite": siteConfig.accessibilityContact,
  "acces.mois": String(siteConfig.courseAccessMonths),
  "cgv.version": CGV_VERSION,
  "cgu.version": CGU_VERSION,
};

export function Info({ cle }: { cle: string }) {
  if (!(cle in legalInfo)) throw new Error(`Unknown legal info key: ${cle}`);
  return <>{legalInfo[cle]}</>;
}

function Table({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div role="region" aria-label={caption} tabIndex={0} className="mdx-table overflow-x-auto">
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {c}
                  </th>
                ) : (
                  <td key={i}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SousTraitants() {
  return (
    <Table
      caption="Sous-traitants"
      head={["Prestataire", "Rôle", "Localisation des données", "Transferts hors UE"]}
      rows={processors.map((s) => [s.name, s.role, s.location, s.transfer ?? "Aucun"])}
    />
  );
}

export function Traitements() {
  const name = (id: string) =>
    processors.find((s) => s.id === id)?.name.replace(/ \[.*\]$/, "") ?? id;
  return (
    <div className="flex flex-col gap-6">
      {treatments.map((t) => (
        <section key={t.id} aria-labelledby={`traitement-${t.id}`}>
          <h3 id={`traitement-${t.id}`}>{t.purpose}</h3>
          <ul>
            <li>Base légale : {t.legalBasis}.</li>
            <li>Données : {t.data.join(" ; ")}.</li>
            <li>Durée de conservation : {t.retention}.</li>
            <li>Prestataires : {t.processors.map(name).join(", ")}.</li>
          </ul>
        </section>
      ))}
    </div>
  );
}

export function StockageLocal() {
  return (
    <Table
      caption="Cookies et stockage local strictement nécessaires"
      head={["Nom", "Type", "Finalité", "Durée"]}
      rows={essentialStorage.map((c) => [c.name, c.kind, c.purpose, c.duration])}
    />
  );
}

/** Purposes requiring consent (none in v1). */
export function TraceursSoumisAConsentement() {
  if (CONSENT_PURPOSES.length === 0)
    return <p>Aucun. Le site ne dépose aucun traceur publicitaire ni de réseau social.</p>;
  return (
    <Table
      caption="Traceurs soumis à consentement"
      head={["Finalité", "Description", "Partenaires"]}
      rows={CONSENT_PURPOSES.map((c) => [c.label, c.description, c.vendors.join(", ")])}
    />
  );
}

/** Training organisation box: only when a declaration number is enabled in site.ts. */
export function OrganismeDeFormation() {
  const t = siteConfig.training;
  if (!t.showNda || !t.ndaNumber) {
    return (
      <p>
        L’éditeur n’est pas déclaré comme organisme de formation. Les formations ne sont pas
        éligibles au financement par le compte personnel de formation.
      </p>
    );
  }
  return <p>Déclaration d’activité enregistrée sous le numéro {t.ndaNumber}.</p>;
}

export const legalComponents: MDXComponents = {
  Info,
  SousTraitants,
  Traitements,
  StockageLocal,
  TraceursSoumisAConsentement,
  OrganismeDeFormation,
  PreferencesCookies: CookiePreferences,
};
