import type { Route } from "next";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/commande/annulee");

export default async function OrderCanceledPage({ searchParams }: PageProps<"/commande/annulee">) {
  const r = getRoute("/commande/annulee");
  const formation = (await searchParams).formation;
  const slug =
    typeof formation === "string" && /^[a-z0-9-]{3,80}$/.test(formation) ? formation : null;
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-wrap gap-3">
        {slug && (
          <ButtonLink href={`/panier?formation=${slug}` as Route}>Reprendre ma commande</ButtonLink>
        )}
        <ButtonLink href="/formations" variant={slug ? "secondary" : "primary"}>
          Voir les formations
        </ButtonLink>
      </div>
    </Container>
  );
}
