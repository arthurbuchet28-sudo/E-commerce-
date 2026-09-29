import { ResetRequestForm } from "@/components/account/AuthForms";
import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { supabaseConfig } from "@/lib/supabase/config";

export const metadata = pageMetadata("/compte/mot-de-passe");

export default function ResetPage() {
  const r = getRoute("/compte/mot-de-passe");
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      {!supabaseConfig() ? (
        <MemberAreaUnavailable />
      ) : (
        <section
          aria-label="Demande de réinitialisation"
          className="rounded-ui border border-line bg-sheet p-6"
        >
          <ResetRequestForm />
        </section>
      )}
    </Container>
  );
}
