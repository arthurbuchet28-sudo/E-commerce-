import type { Route } from "next";
import Link from "next/link";

import { createCourse } from "@/app/admin/actions";
import { ActionForm, AdminTextField } from "@/components/admin/ActionForm";
import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { requireAdmin } from "@/lib/admin/auth";
import { formatEuros } from "@/lib/commerce/format";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/admin/formations");

export default async function AdminCoursesPage() {
  const r = getRoute("/admin/formations");
  const { supabase } = await requireAdmin(r.path);
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, slug, code, title, status, is_free, price_cents, position, modules(count), lessons(count)",
    )
    .order("position")
    .order("title");

  return (
    <>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-10">
        <div
          role="region"
          aria-label="Toutes les formations, publiées ou en brouillon"
          tabIndex={0}
          className="overflow-x-auto rounded-ui border border-line bg-sheet"
        >
          <table className="w-full text-left">
            <caption className="sr-only">Toutes les formations, publiées ou en brouillon</caption>
            <thead className="border-b border-line text-small text-muted">
              <tr>
                <th scope="col" className="p-3">
                  Formation
                </th>
                <th scope="col" className="p-3">
                  Statut
                </th>
                <th scope="col" className="p-3">
                  Prix
                </th>
                <th scope="col" className="p-3 text-right">
                  Modules
                </th>
                <th scope="col" className="p-3 text-right">
                  Leçons
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(courses ?? []).map((c) => (
                <tr key={c.id}>
                  <th scope="row" className="p-3">
                    <Link
                      href={`/admin/formations/${c.id}` as Route}
                      className="link font-semibold"
                    >
                      {c.code} · {c.title}
                    </Link>
                  </th>
                  <td className="p-3">{c.status === "published" ? "Publiée" : "Brouillon"}</td>
                  <td className="p-3">
                    {c.is_free || !c.price_cents ? "Gratuite" : `${formatEuros(c.price_cents)} TTC`}
                  </td>
                  <td className="p-3 text-right">{c.modules[0]?.count ?? 0}</td>
                  <td className="p-3 text-right">{c.lessons[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section
          aria-labelledby="nouvelle-title"
          className="flex max-w-2xl flex-col gap-4 rounded-ui border border-line bg-sheet p-6"
        >
          <h2 id="nouvelle-title" className="text-h3">
            Nouvelle formation
          </h2>
          <p className="text-small text-muted">
            Elle est créée en brouillon, invisible du public, puis complétée sur sa page.
          </p>
          <ActionForm action={createCourse} submitLabel="Créer la formation">
            <AdminTextField id="nouvelle-titre" name="title" label="Titre" required />
            <AdminTextField
              id="nouvelle-slug"
              name="slug"
              label="Adresse (slug)"
              hint="Minuscules et tirets, par exemple : trouver-ses-fournisseurs"
              required
            />
            <AdminTextField
              id="nouvelle-code"
              name="code"
              label="Code"
              hint="Par exemple : F2"
              required
            />
          </ActionForm>
        </section>
      </div>
    </>
  );
}
