import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <Container className="flex max-w-3xl flex-col gap-6 py-16">
      <h1 className="text-h1">Cette page est introuvable</h1>
      <p className="text-lead text-muted">
        Le lien est peut-être erroné, ou la page a été déplacée. Voici où reprendre votre route.
      </p>
      <div>
        <ButtonLink href="/se-lancer">Reprendre le parcours « Se lancer »</ButtonLink>
      </div>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/guides" className="link">
            Parcourir les guides
          </Link>
        </li>
        <li>
          <Link href="/outils" className="link">
            Utiliser les outils de calcul
          </Link>
        </li>
        <li>
          <Link href="/glossaire" className="link">
            Chercher un terme dans le glossaire
          </Link>
        </li>
        <li>
          <Link href="/plan-du-site" className="link">
            Voir le plan du site
          </Link>
        </li>
      </ul>
    </Container>
  );
}
