import { CalendarCheck } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Callout, type CalloutType } from "@/components/ui/Callout";
import { GlossaryTerm } from "@/components/ui/GlossaryTerm";
import { personas, type PersonaId } from "@/data/personas";
import {
  formatCheckedAt,
  formatCheckedAtShort,
  formatRef,
  getRef,
  isRefKey,
} from "@/data/reference";
import { getTerm } from "@/lib/content/glossary";
import type { Source } from "@/lib/content/schemas";

import { Checklist } from "./Checklist";

export function Encadre({
  type = "info",
  titre,
  children,
}: {
  type?: CalloutType;
  titre?: string;
  children: ReactNode;
}) {
  return (
    <Callout type={type} title={titre}>
      {children}
    </Callout>
  );
}

/** Numbered steps: wraps a Markdown ordered list. */
export function Etapes({ children }: { children: ReactNode }) {
  return <div className="etapes">{children}</div>;
}

export function Exemple({ persona, children }: { persona: PersonaId; children: ReactNode }) {
  const p = personas[persona];
  if (!p) throw new Error(`<Exemple>: unknown persona "${persona}"`);
  return (
    <aside className="not-prose rounded-ui border border-line bg-sheet p-5 font-sans text-ui">
      <p className="font-semibold">
        L’exemple de {p.name}, {p.age} ans
      </p>
      <p className="mb-2 text-small text-muted">{p.summary}</p>
      <div className="[&_a]:link space-y-2">{children}</div>
    </aside>
  );
}

/**
 * A figure from src/data/reference.ts. Compact inline source (short name + check month);
 * the full source name is in the link's accessible name.
 */
export function Chiffre({ id: key }: { id: string }) {
  if (!isRefKey(key)) throw new Error(`<Chiffre>: unknown reference "${key}"`);
  const r = getRef(key);
  const checked = formatCheckedAt(r.checkedAt);
  return (
    <span>
      <strong className="font-semibold whitespace-nowrap">{formatRef(r)}</strong>
      {r.status === "a-verifier" && r.value !== null && " [À VÉRIFIER]"}{" "}
      <span className="font-sans text-small whitespace-nowrap text-muted">
        (
        <a
          href={r.source.url}
          className="link"
          rel="noopener"
          aria-label={`Source : ${r.source.name}, vérifiée en ${checked}`}
          title={`${r.source.name}, vérifié en ${checked}`}
        >
          {r.source.short}
        </a>
        , {formatCheckedAtShort(r.checkedAt)})
      </span>
    </span>
  );
}

export function SourcesList({ sources }: { sources: Source[] }) {
  return (
    <ol className="list-decimal space-y-1 pl-5 font-sans text-small">
      {sources.map((s) => (
        <li key={s.url + s.title}>
          <a href={s.url} className="link" rel="noopener">
            {s.title}
          </a>
          <span className="text-muted">, consulté le {formatDate(s.consultedAt)}</span>
        </li>
      ))}
    </ol>
  );
}

export function AFaireAujourdhui({ items }: { items: string[] }) {
  if (items.length === 0 || items.length > 3) {
    throw new Error("<AFaireAujourdhui>: between 1 and 3 actions");
  }
  return (
    <section
      aria-labelledby="a-faire"
      className="not-prose rounded-ui border-2 border-sage bg-sage-soft p-5 font-sans text-ui"
    >
      <h2 id="a-faire" className="mb-3 flex items-center gap-2 font-sans text-h3 text-text">
        <CalendarCheck aria-hidden className="size-6 text-sage" />
        Ce que vous pouvez faire aujourd’hui
      </h2>
      <ol className="list-decimal space-y-1.5 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}

/** Glossary term with tooltip; fails the build when the term does not exist. */
export function Terme({ id, children }: { id: string; children: ReactNode }) {
  const term = getTerm(id);
  if (!term) throw new Error(`<Terme>: unknown glossary term "${id}"`);
  return (
    <GlossaryTerm href={term.href} definition={term.definition}>
      {children}
    </GlossaryTerm>
  );
}

function SmartLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) return <Link href={href as Route} {...props} />;
  return <a href={href} rel="noopener" {...props} />;
}

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div
      role="region"
      aria-label="Tableau"
      tabIndex={0}
      className="not-prose overflow-x-auto rounded-ui border border-line bg-sheet font-sans text-ui"
    >
      <table className="mdx-table w-full border-collapse text-left" {...props} />
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

/** Components available in every MDX file. `sources` binds <Sources /> to the document. */
export function mdxComponents(sources: Source[] = []): MDXComponents {
  return {
    Encadre,
    Etapes,
    Exemple,
    Chiffre,
    Checklist,
    AFaireAujourdhui,
    Terme,
    Sources: () => <SourcesList sources={sources} />,
    a: SmartLink,
    table: Table,
  };
}
