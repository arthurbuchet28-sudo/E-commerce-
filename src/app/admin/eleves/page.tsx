import type { Route } from "next";

import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { getRoute } from "@/config/routes";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateParis } from "@/lib/commerce/format";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/admin/eleves");

const PAGE_SIZE = 50;

export default async function AdminStudentsPage({ searchParams }: PageProps<"/admin/eleves">) {
  const r = getRoute("/admin/eleves");
  const { supabase } = await requireAdmin(r.path);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { data } = await supabase.rpc("admin_students", {
    p_search: q,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  const students = data ?? [];
  const total = Number(students[0]?.total ?? 0);
  const hrefFor = (p: number) =>
    `/admin/eleves?${new URLSearchParams({ ...(q && { q }), page: String(p) })}` as Route;

  return (
    <>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-6">
        <form role="search" className="flex flex-wrap items-end gap-3" action="/admin/eleves">
          <TextField
            id="eleves-recherche"
            name="q"
            label="Rechercher (e-mail ou nom)"
            defaultValue={q}
          />
          <Button type="submit" variant="secondary">
            Rechercher
          </Button>
        </form>
        <p role="status">
          {total} membre{total > 1 ? "s" : ""}
          {q && ` pour « ${q} »`}
        </p>
        <div
          role="region"
          aria-label="Membres inscrits"
          tabIndex={0}
          className="overflow-x-auto rounded-ui border border-line bg-sheet"
        >
          <table className="w-full text-left">
            <caption className="sr-only">Membres inscrits</caption>
            <thead className="border-b border-line text-small text-muted">
              <tr>
                <th scope="col" className="p-3">
                  Membre
                </th>
                <th scope="col" className="p-3">
                  Inscrit le
                </th>
                <th scope="col" className="p-3 text-right">
                  Formations
                </th>
                <th scope="col" className="p-3 text-right">
                  Achats
                </th>
                <th scope="col" className="p-3">
                  Dernière activité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((s) => (
                <tr key={s.id}>
                  <th scope="row" className="p-3 font-normal">
                    <span className="font-semibold">{s.display_name ?? "—"}</span>
                    {s.role === "admin" && <span className="text-small text-muted"> (admin)</span>}
                    <span className="block text-small break-all text-muted">{s.email}</span>
                  </th>
                  <td className="p-3">{formatDateParis(s.created_at)}</td>
                  <td className="p-3 text-right">{s.courses}</td>
                  <td className="p-3 text-right">{s.paid_orders}</td>
                  <td className="p-3">
                    {s.last_activity ? formatDateParis(s.last_activity) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={Math.ceil(total / PAGE_SIZE)} hrefFor={hrefFor} />
      </div>
    </>
  );
}
