import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/account/AuthForms";
import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getUser } from "@/lib/supabase/server";

export const metadata = pageMetadata("/compte/inscription");

export default async function SignUpPage() {
  const r = getRoute("/compte/inscription");
  const { supabase, user } = await getUser();
  if (user) redirect("/compte");
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      {!supabase ? (
        <MemberAreaUnavailable />
      ) : (
        <div className="flex flex-col gap-8">
          <section
            aria-label="Formulaire d’inscription"
            className="rounded-ui border border-line bg-sheet p-6"
          >
            <SignUpForm />
          </section>
          <div className="text-small text-muted">
            <p className="mb-2 font-semibold text-text">Ce que nous faisons de vos données</p>
            <p>
              Votre adresse e-mail sert à vous connecter et à vous écrire au sujet de votre compte.
              Aucune newsletter sans votre accord. Vous pouvez exporter vos données ou supprimer
              votre compte à tout moment depuis votre espace.
            </p>
          </div>
          <p>
            Déjà inscrit ?{" "}
            <Link href="/compte/connexion" className="link font-semibold">
              Me connecter
            </Link>
          </p>
        </div>
      )}
    </Container>
  );
}
