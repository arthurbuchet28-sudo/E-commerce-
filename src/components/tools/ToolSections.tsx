import Link from "next/link";
import type { ReactNode } from "react";

import { formatCheckedAt, formatRef, getRef, type RefKey } from "@/data/reference";
import { getGuide } from "@/lib/content/guides";

/** Method, hypotheses, data and further reading: displayed under every tool. */
export function ToolSections({
  method,
  hypotheses,
  refs = [],
  dataNote,
  guide,
}: {
  method: ReactNode;
  hypotheses: string[];
  refs?: RefKey[];
  dataNote?: ReactNode;
  /** Related guide, shown only if published (drafts are hidden in production). */
  guide?: { category: string; slug: string };
}) {
  const related = guide ? getGuide(guide.category, guide.slug) : undefined;
  return (
    <div className="mt-12 grid gap-10 border-t border-line pt-10 lg:grid-cols-2">
      <section aria-labelledby="methode-title" className="flex flex-col gap-3">
        <h2 id="methode-title" className="text-h2">
          Méthode de calcul
        </h2>
        <div className="prose-guide">{method}</div>
      </section>
      <div className="flex flex-col gap-10">
        <section aria-labelledby="hypotheses-title" className="flex flex-col gap-3">
          <h2 id="hypotheses-title" className="text-h3">
            Hypothèses
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            {hypotheses.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
        {(refs.length > 0 || dataNote) && (
          <section aria-labelledby="donnees-title" className="flex flex-col gap-3">
            <h2 id="donnees-title" className="text-h3">
              Données utilisées
            </h2>
            {refs.length > 0 && (
              <ul className="flex flex-col gap-2 text-small">
                {refs.map((key) => {
                  const r = getRef(key);
                  return (
                    <li key={key}>
                      <span className="font-semibold">{r.label}</span>
                      {" "}: {formatRef(r)}
                      {r.status === "a-verifier" && r.value !== null && " [À VÉRIFIER]"}
                      <span className="text-muted">
                        {" "}
                        (
                        <a href={r.source.url} className="link" rel="noopener">
                          {r.source.name}
                        </a>
                        , vérifié en {formatCheckedAt(r.checkedAt)})
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {dataNote && <div className="text-small text-muted">{dataNote}</div>}
          </section>
        )}
        {related && (
          <section aria-labelledby="plus-loin-title" className="flex flex-col gap-2">
            <h2 id="plus-loin-title" className="text-h3">
              Pour aller plus loin
            </h2>
            <Link href={related.href} className="link">
              {related.title}
            </Link>
          </section>
        )}
        <p className="text-small text-muted">
          Résultats indicatifs, qui dépendent des valeurs saisies. Ils ne remplacent pas l’avis d’un
          expert-comptable.
        </p>
      </div>
    </div>
  );
}
