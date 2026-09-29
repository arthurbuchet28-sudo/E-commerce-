import Link from "next/link";

import { NewPasswordForm } from "@/components/account/AuthForms";
import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getUser } from "@/lib/supabase/server";

export const metadata = pageMetadata("/compte/nouveau-mot-de-passe");

export default async function NewPasswordPage() {
  const r = getRoute("/compte/nouveau-mot-de-passe");
  const { supabase, user } = await getUser();
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      {!supabase ? (
        <MemberAreaUnavailable />
      ) : !user ? (
        <Callout type="attention" title="Lien expiré">
          <p>
            Ouvrez le lien reçu par e-mail pour choisir un nouveau mot de passe, ou{" "}
            <Link href="/compte/mot-de-passe" className="link">
              demandez un nouvel e-mail
            </Link>
            .
          </p>
        </Callout>
      ) : (
        <section
          aria-label="Nouveau mot de passe"
          className="rounded-ui border border-line bg-sheet p-6"
        >
          <NewPasswordForm />
        </section>
      )}
    </Container>
  );
}
