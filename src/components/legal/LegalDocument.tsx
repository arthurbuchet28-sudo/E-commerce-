import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { formatDate, mdxComponents, SourcesList } from "@/components/mdx/components";
import { Callout } from "@/components/ui/Callout";
import { getRoute, type StaticPath } from "@/config/routes";
import { getLegalPage, type LegalSlug } from "@/lib/content/legal";
import { renderMdx } from "@/lib/content/mdx";

import { legalComponents } from "./LegalComponents";

/** A legal page rendered from content/legal/<slug>.mdx, with its version and status. */
export async function LegalDocument({ path, slug }: { path: StaticPath; slug: LegalSlug }) {
  const r = getRoute(path);
  const { data, body } = getLegalPage(slug);
  const content = await renderMdx(body, { ...mdxComponents(data.sources), ...legalComponents });
  return (
    <Container className="max-w-3xl">
      <PageHeader title={r.h1} crumbs={breadcrumbFor(r.path, r.label)} />
      <div className="flex flex-col gap-8">
        {data.status === "trame" && (
          <Callout type="attention" title="Trame à faire valider par un professionnel du droit">
            <p>
              Ce texte est un modèle de travail. Il doit être relu et validé par un avocat ou un
              juriste avant la mise en ligne du site. Les passages entre crochets sont à compléter
              ou à vérifier.
            </p>
          </Callout>
        )}
        <p className="text-small text-muted">
          Version {data.version}, mise à jour le {formatDate(data.updatedAt)}.
        </p>
        <div className="prose-guide">{content}</div>
        {data.sources.length > 0 && (
          <section
            aria-labelledby="sources-title"
            className="flex flex-col gap-3 border-t border-line pt-6"
          >
            <h2 id="sources-title" className="text-h3">
              Sources
            </h2>
            <SourcesList sources={data.sources} />
          </section>
        )}
      </div>
    </Container>
  );
}
