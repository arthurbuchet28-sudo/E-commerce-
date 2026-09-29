import { getRoute, type StaticPath } from "@/config/routes";

import { breadcrumbFor, Container, PageHeader } from "./PageHeader";

/** Temporary body for pages whose content is built in a later phase. */
export function PagePlaceholder({ path }: { path: StaticPath }) {
  const r = getRoute(path);
  return (
    <Container>
      <PageHeader title={r.h1} lead={r.description} crumbs={breadcrumbFor(r.path, r.label)} />
      <p className="rounded-ui border border-dashed border-border bg-sheet p-5 text-muted">
        Cette page est en cours de construction.
      </p>
    </Container>
  );
}
