import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { ConfirmSubscription } from "@/components/newsletter/ConfirmSubscription";
import { Callout } from "@/components/ui/Callout";
import { getRoute } from "@/config/routes";
import { hashToken } from "@/lib/newsletter/server";
import { pageMetadata } from "@/lib/seo/metadata";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = pageMetadata("/newsletter/confirmer");

/** Landing page of the confirmation link: reads the token, confirms only on click. */
export default async function ConfirmPage({ searchParams }: PageProps<"/newsletter/confirmer">) {
  const r = getRoute("/newsletter/confirmer");
  const token = (await searchParams).token;
  const admin = createAdminClient();
  const valid = typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
  const { data: status } =
    admin && valid
      ? await admin.rpc("newsletter_token_status", { p_token_hash: hashToken(token) })
      : { data: "invalid" };

  return (
    <Container className="max-w-2xl">
      <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />
      {status === "valid" && valid ? (
        <ConfirmSubscription token={token} />
      ) : (
        <Callout type="attention" title="Lien invalide ou expiré">
          <p>
            Ce lien de confirmation n’est plus valable : il a déjà servi ou il a expiré.{" "}
            <Link href="/ressources" className="link">
              Refaire une demande
            </Link>
            .
          </p>
        </Callout>
      )}
    </Container>
  );
}
