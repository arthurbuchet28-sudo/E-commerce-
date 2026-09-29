import Link from "next/link";
import { redirect } from "next/navigation";

import { MagicLinkForm, SignInForm } from "@/components/account/AuthForms";
import { MemberAreaUnavailable } from "@/components/account/Unavailable";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { getRoute } from "@/config/routes";
import { safeNext } from "@/lib/security/redirect";
import { pageMetadata } from "@/lib/seo/metadata";
import { getUser } from "@/lib/supabase/server";

export const metadata = pageMetadata("/compte/connexion");

export default async function SignInPage({ searchParams }: PageProps<"/compte/connexion">) {
  const r = getRoute("/compte/connexion");
  const params = await searchParams;
  const next = safeNext(params.next);
  const { supabase, user } = await getUser();
  if (user) redirect("/compte");

  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      {!supabase ? (
        <MemberAreaUnavailable />
      ) : (
        <div className="flex flex-col gap-10">
          {params.compte === "supprime" && (
            <Callout type="info" title="Votre compte a été supprimé">
              <p>
                Vos données personnelles ont été effacées. Merci d’avoir utilisé Première Vente.
              </p>
            </Callout>
          )}
          {params.erreur === "lien" && (
            <Callout type="attention" title="Ce lien n’est plus valable">
              <p>
                Il a peut-être déjà été utilisé ou a expiré. Connectez-vous ou demandez un nouveau
                lien.
              </p>
            </Callout>
          )}
          <section
            aria-labelledby="mdp-title"
            className="rounded-ui border border-line bg-sheet p-6"
          >
            <h2 id="mdp-title" className="mb-4 text-h3">
              Avec mon mot de passe
            </h2>
            <SignInForm next={next} />
          </section>
          <section
            aria-labelledby="lien-title"
            className="rounded-ui border border-line bg-sheet p-6"
          >
            <h2 id="lien-title" className="mb-2 text-h3">
              Sans mot de passe
            </h2>
            <p className="mb-4 text-muted">
              Recevez un lien de connexion par e-mail, valable une heure.
            </p>
            <MagicLinkForm />
          </section>
          <p>
            Pas encore de compte ?{" "}
            <Link href="/compte/inscription" className="link font-semibold">
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      )}
    </Container>
  );
}
