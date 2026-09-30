import { CircleAlert, CircleCheck, CircleDashed, CircleX } from "lucide-react";
import { connection } from "next/server";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { overallState, type CheckState } from "@/lib/operations/checks";
import { collectStatus } from "@/lib/operations/status";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/statut");

const STATE: Record<CheckState, { text: string; className: string; Icon: typeof CircleCheck }> = {
  ok: { text: "Opérationnel", className: "text-sage", Icon: CircleCheck },
  degraded: { text: "Perturbé", className: "text-signal", Icon: CircleAlert },
  down: { text: "Indisponible", className: "text-danger", Icon: CircleX },
  simulated: { text: "Simulé", className: "text-muted", Icon: CircleDashed },
};

const OVERALL = {
  ok: "Tous les services fonctionnent normalement.",
  degraded: "Un service est perturbé. Le site reste accessible.",
  down: "Les comptes et les formations sont momentanément indisponibles.",
};

/** Public status page: checked on each visit, no personal or sensitive detail. */
export default async function StatusPage() {
  await connection();
  const r = getRoute("/statut");
  const checks = await collectStatus();
  const overall = overallState(checks);
  const checkedAt = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date());
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <p className="mb-6 rounded-ui border border-line bg-sheet p-5 font-semibold" role="status">
        {OVERALL[overall]}
      </p>
      <ul className="flex flex-col divide-y divide-line rounded-ui border border-line bg-sheet">
        {checks.map((c) => {
          const { text, className, Icon } = STATE[c.state];
          return (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <span className="font-semibold">{c.label}</span>
              <span className="flex items-center gap-2">
                <Icon aria-hidden className={`size-5 shrink-0 ${className}`} />
                <span>
                  {text}
                  {c.detail !== text && <span className="text-muted"> · {c.detail}</span>}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-small text-muted">
        Vérifié le {checkedAt}. Les services externes (paiement, e-mails, vidéos) sont contrôlés sur
        leur configuration ; en cas de problème persistant, écrivez-nous depuis la page Contact.
      </p>
    </Container>
  );
}
