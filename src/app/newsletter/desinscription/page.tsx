import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/newsletter/desinscription");

const messages: Record<string, string> = {
  ok: "Vous êtes désinscrit : vous ne recevrez plus la newsletter.",
  inconnu:
    "Ce lien de désinscription n’est pas reconnu : l’adresse a peut-être déjà été supprimée.",
  erreur: "La désinscription n’a pas pu être enregistrée. Réessayez dans quelques minutes.",
};

export default async function UnsubscribedPage({
  searchParams,
}: PageProps<"/newsletter/desinscription">) {
  const r = getRoute("/newsletter/desinscription");
  const statut = (await searchParams).statut;
  const message = typeof statut === "string" ? messages[statut] : undefined;
  return (
    <Container className="max-w-2xl">
      <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-4">
        <p role="status">
          {message ?? "Utilisez le lien « Se désinscrire » présent en bas de chaque e-mail."}
        </p>
        <p>
          Vous avez changé d’avis ?{" "}
          <Link href="/ressources" className="link">
            Vous pouvez vous réinscrire
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
