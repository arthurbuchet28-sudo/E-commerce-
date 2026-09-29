import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { requireAdmin } from "@/lib/admin/auth";
import { formatEuros } from "@/lib/commerce/format";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/admin");

/** A learner who has not opened a lesson for this long is counted as having dropped out. */
const INACTIVE_DAYS = 14;

type Dashboard = {
  sales: {
    paidCount: number;
    paidCents: number;
    paidCount30: number;
    paidCents30: number;
    refundedCount: number;
    refundedCents: number;
  };
  members: { total: number; last30: number };
  newsletter: { confirmed: number; pending: number; unsubscribed: number };
  pendingRefunds: number;
  courses: Array<{
    id: string;
    title: string;
    lessons: number;
    enrolled: number;
    started: number;
    completed: number;
    dropOffs: Array<{ lessonId: string; title: string; learners: number }>;
  }>;
};

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-ui border border-line bg-sheet p-5">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="font-serif text-h2 font-semibold text-ink">{value}</dd>
      {detail && <dd className="text-small text-muted">{detail}</dd>}
    </div>
  );
}

const percent = (n: number, d: number) => (d === 0 ? "—" : `${Math.round((n / d) * 100)} %`);

export default async function AdminDashboardPage() {
  const r = getRoute("/admin");
  const { supabase } = await requireAdmin();
  const { data } = await supabase.rpc("admin_dashboard", { p_inactive_days: INACTIVE_DAYS });
  const d = data as unknown as Dashboard;

  return (
    <>
      <PageHeader title="Tableau de bord" crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-10">
        <section aria-labelledby="chiffres-title">
          <h2 id="chiffres-title" className="mb-4 text-h3">
            Chiffres clés
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Ventes (30 derniers jours)"
              value={formatEuros(d.sales.paidCents30)}
              detail={`${d.sales.paidCount30} commande(s) · depuis l’ouverture : ${formatEuros(d.sales.paidCents)}`}
            />
            <Stat
              label="Rétractations et remboursements"
              value={String(d.sales.refundedCount)}
              detail={`${formatEuros(d.sales.refundedCents)} remboursés${d.pendingRefunds ? ` · ${d.pendingRefunds} en attente` : ""}`}
            />
            <Stat
              label="Membres inscrits"
              value={String(d.members.total)}
              detail={`dont ${d.members.last30} ces 30 derniers jours`}
            />
            <Stat
              label="Abonnés à la newsletter"
              value={String(d.newsletter.confirmed)}
              detail={`${d.newsletter.pending} en attente de confirmation`}
            />
          </dl>
        </section>

        <section aria-labelledby="completion-title" className="flex flex-col gap-4">
          <h2 id="completion-title" className="text-h3">
            Formations : progression des élèves
          </h2>
          <div
            role="region"
            aria-label="Inscrits, élèves ayant commencé et terminé, par formation"
            tabIndex={0}
            className="overflow-x-auto rounded-ui border border-line bg-sheet"
          >
            <table className="w-full text-left">
              <caption className="sr-only">
                Inscrits, élèves ayant commencé et terminé, par formation
              </caption>
              <thead className="border-b border-line text-small text-muted">
                <tr>
                  <th scope="col" className="p-3">
                    Formation
                  </th>
                  <th scope="col" className="p-3 text-right">
                    Inscrits
                  </th>
                  <th scope="col" className="p-3 text-right">
                    Ont commencé
                  </th>
                  <th scope="col" className="p-3 text-right">
                    Ont terminé
                  </th>
                  <th scope="col" className="p-3 text-right">
                    Taux de complétion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {d.courses.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className="p-3 font-semibold">
                      {c.title}
                    </th>
                    <td className="p-3 text-right">{c.enrolled}</td>
                    <td className="p-3 text-right">{c.started}</td>
                    <td className="p-3 text-right">{c.completed}</td>
                    <td className="p-3 text-right">{percent(c.completed, c.enrolled)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-small text-muted">
            Terminé : toutes les leçons marquées comme terminées. Taux de complétion : élèves ayant
            terminé rapportés aux inscrits.
          </p>
        </section>

        <section aria-labelledby="abandons-title" className="flex flex-col gap-4">
          <h2 id="abandons-title" className="text-h3">
            Où les élèves s’arrêtent
          </h2>
          <p className="text-muted">
            Élèves ayant commencé une formation sans la terminer, sans activité depuis{" "}
            {INACTIVE_DAYS}&nbsp;jours, comptés à leur première leçon non terminée.
          </p>
          {d.courses.every((c) => c.dropOffs.length === 0) ? (
            <p>Aucun abandon à signaler pour l’instant.</p>
          ) : (
            d.courses
              .filter((c) => c.dropOffs.length > 0)
              .map((c) => (
                <div key={c.id}>
                  <h3 className="mb-2 font-semibold">{c.title}</h3>
                  <ul className="flex list-disc flex-col gap-1 pl-5">
                    {c.dropOffs.map((o) => (
                      <li key={o.lessonId}>
                        {o.title} : {o.learners} élève(s)
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          )}
        </section>
      </div>
    </>
  );
}
