import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateParis } from "@/lib/commerce/format";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/admin/newsletter");

const statusLabels: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente de confirmation",
  unsubscribed: "Désinscrit",
};

export default async function AdminNewsletterPage() {
  const r = getRoute("/admin/newsletter");
  const { supabase } = await requireAdmin(r.path);
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status, source, requested_at, confirmed_at, unsubscribed_at, sequence_step")
    .order("requested_at", { ascending: false })
    .limit(200);
  const list = subscribers ?? [];
  const count = (s: string) => list.filter((x) => x.status === s).length;

  return (
    <>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p role="status">
            Sur les {list.length} inscriptions les plus récentes : {count("confirmed")}{" "}
            confirmée(s), {count("pending")} en attente, {count("unsubscribed")} désinscription(s).
          </p>
          <a href="/api/admin/export/newsletter" className="link font-semibold" download>
            Exporter les abonnés confirmés (CSV)
          </a>
        </div>
        <p className="text-small text-muted">
          Seules les adresses confirmées peuvent recevoir la newsletter. Les demandes non confirmées
          sont effacées après 30 jours.
        </p>
        <div
          role="region"
          aria-label="Inscriptions à la newsletter"
          tabIndex={0}
          className="overflow-x-auto rounded-ui border border-line bg-sheet"
        >
          <table className="w-full text-left">
            <caption className="sr-only">Inscriptions à la newsletter</caption>
            <thead className="border-b border-line text-small text-muted">
              <tr>
                <th scope="col" className="p-3">
                  Adresse
                </th>
                <th scope="col" className="p-3">
                  Statut
                </th>
                <th scope="col" className="p-3">
                  Origine
                </th>
                <th scope="col" className="p-3">
                  Demande
                </th>
                <th scope="col" className="p-3">
                  Confirmation
                </th>
                <th scope="col" className="p-3 text-right">
                  E-mails reçus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((s) => (
                <tr key={s.id}>
                  <th scope="row" className="p-3 font-normal break-all">
                    {s.email}
                  </th>
                  <td className="p-3">{statusLabels[s.status] ?? s.status}</td>
                  <td className="p-3">{s.source}</td>
                  <td className="p-3">{formatDateParis(s.requested_at)}</td>
                  <td className="p-3">{s.confirmed_at ? formatDateParis(s.confirmed_at) : "—"}</td>
                  <td className="p-3 text-right">{s.sequence_step}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
