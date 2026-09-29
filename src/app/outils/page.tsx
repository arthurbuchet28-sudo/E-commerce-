import {
  Calculator,
  ClipboardCheck,
  Compass,
  LayoutGrid,
  Scale,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { getRoute, routes } from "@/config/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils");

const icons: Record<string, LucideIcon> = {
  "/outils/calculateur-prix-marge": Calculator,
  "/outils/simulateur-micro-entreprise": Scale,
  "/outils/seuil-de-rentabilite": TrendingUp,
  "/outils/quel-modele-ecommerce": Compass,
  "/outils/comparateur-plateformes": LayoutGrid,
  "/outils/checklist-lancement": ClipboardCheck,
};

export default function ToolsPage() {
  const r = getRoute("/outils");
  const tools = routes.filter((x) => x.group === "outils" && x.path !== "/outils");
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const Icon = icons[t.path] ?? Calculator;
          return (
            <li key={t.path} className="flex">
              <article className="group relative flex w-full flex-col gap-3 rounded-ui border border-line bg-sheet p-5 hover:border-ink">
                <Icon aria-hidden className="size-7 text-sage" />
                <h2 className="text-h3">
                  <Link
                    href={t.path}
                    className="group-hover:underline after:absolute after:inset-0"
                  >
                    {t.label}
                  </Link>
                </h2>
                <p className="text-muted">{t.description}</p>
              </article>
            </li>
          );
        })}
      </ul>
      <p className="mt-8 text-small text-muted">
        Gratuits et sans compte. Vos saisies restent dans votre navigateur ; l’enregistrement de vos
        simulations dans votre compte arrivera avec l’espace membre.
      </p>
    </Container>
  );
}
