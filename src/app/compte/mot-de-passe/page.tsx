import { connection } from "next/server";

import { ResetRequestForm } from "@/components/account/AuthForms";
import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { supabaseConfig } from "@/lib/supabase/config";

export const metadata = pageMetadata("/compte/mot-de-passe");

export default async function ResetPage() {
  // Private pages use the nonce CSP (src/proxy.ts), which needs per-request rendering.
  await connection();
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
