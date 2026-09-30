import { markMessageHandled } from "@/app/admin/actions";
import { breadcrumbFor, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { getRoute } from "@/config/routes";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTimeParis } from "@/lib/commerce/format";
import { CONTACT_RETENTION_MONTHS, CONTACT_TOPICS } from "@/lib/contact/topics";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/admin/messages");

export default async function AdminMessagesPage() {
  const r = getRoute("/admin/messages");
  const { supabase } = await requireAdmin(r.path);
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, topic, message, created_at, handled_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const pending = (messages ?? []).filter((m) => !m.handled_at).length;

  return (
    <>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-6">
        <p role="status">
          {pending} message(s) à traiter. Les messages sont supprimés automatiquement après{" "}
          {CONTACT_RETENTION_MONTHS / 12}&nbsp;ans.
        </p>
        {(messages ?? []).length === 0 && <p>Aucun message pour l’instant.</p>}
        <ul className="flex flex-col gap-4">
          {(messages ?? []).map((m) => (
            <li
              key={m.id}
              className="flex flex-col gap-2 rounded-ui border border-line bg-sheet p-5"
            >
              <p className="font-semibold">
                {CONTACT_TOPICS[m.topic as keyof typeof CONTACT_TOPICS] ?? m.topic}
                {m.handled_at && <span className="font-normal text-sage"> · traité</span>}
              </p>
              <p className="text-small text-muted">
                {m.name} ·{" "}
                <a href={`mailto:${m.email}`} className="link">
                  {m.email}
                </a>{" "}
                · {formatDateTimeParis(m.created_at)}
              </p>
              <p className="whitespace-pre-line">{m.message}</p>
              <form action={markMessageHandled}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled_at ? "" : "on"} />
                <Button type="submit" variant="secondary">
                  {m.handled_at ? "Marquer comme à traiter" : "Marquer comme traité"}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
