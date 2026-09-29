"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type PagefindResult = {
  url: string;
  excerpt: string;
  meta: { title?: string };
  filters: { type?: string[] };
};

type Pagefind = {
  search: (
    q: string,
  ) => Promise<{ results: Array<{ id: string; data: () => Promise<PagefindResult> }> }>;
};

type Hit = {
  id: string;
  url: string;
  title: string;
  excerpt: Array<{ text: string; mark: boolean }>;
  type: string;
};

const TYPE_ORDER = ["Guide", "Glossaire", "FAQ", "Formation"];

/** Pagefind files are generated at build time; in `pnpm dev` the index does not exist. */
async function loadPagefind(): Promise<Pagefind | null> {
  try {
    const url = "/pagefind/pagefind.js";
    return (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)) as Pagefind;
  } catch {
    return null;
  }
}

/** Turns Pagefind's excerpt (text with <mark>) into safe segments, without injecting HTML. */
function parseExcerpt(html: string): Hit["excerpt"] {
  const doc = new DOMParser().parseFromString(`<p>${html}</p>`, "text/html");
  return [...doc.body.firstChild!.childNodes].map((n) => ({
    text: n.textContent ?? "",
    mark: n.nodeName === "MARK",
  }));
}

function cleanUrl(url: string): string {
  return url.replace(/\.html$/, "").replace(/\/index$/, "/") || "/";
}

export function SearchDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pagefind = useRef<Pagefind | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "unavailable">("idle");
  const titleId = useId();

  const open = useCallback(() => {
    dialog.current?.showModal();
    input.current?.focus();
  }, []);

  // « / » opens the search, except while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus("loading");
      if (pagefind.current === undefined) pagefind.current = await loadPagefind();
      if (!pagefind.current) {
        if (!cancelled) setStatus("unavailable");
        return;
      }
      const search = await pagefind.current.search(q);
      const data = await Promise.all(
        search.results.slice(0, 12).map(async (r) => ({ id: r.id, d: await r.data() })),
      );
      if (cancelled) return;
      setHits(
        data.map(({ id, d }) => ({
          id,
          url: cleanUrl(d.url),
          title: d.meta.title ?? d.url,
          excerpt: parseExcerpt(d.excerpt),
          type: d.filters.type?.[0] ?? "Autre",
        })),
      );
      setStatus("done");
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const groups = [...new Set(hits.map((h) => h.type))].sort(
    (a, b) => (TYPE_ORDER.indexOf(a) + 1 || 99) - (TYPE_ORDER.indexOf(b) + 1 || 99),
  );
  const active = query.trim().length >= 2;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex min-h-11 items-center gap-2 rounded-ui border border-border px-3 hover:bg-ink-soft"
      >
        <Search aria-hidden className="size-5" />
        <span className="sr-only sm:not-sr-only">Rechercher</span>
        <kbd
          aria-hidden
          className="hidden rounded border border-line px-1.5 text-small text-muted lg:inline"
        >
          /
        </kbd>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto mt-[10vh] w-[min(40rem,calc(100vw-2rem))] rounded-ui border border-line bg-sheet p-0 text-text backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
          <h2 id={titleId} className="font-sans text-ui font-semibold text-text">
            Rechercher dans les guides, le glossaire et la FAQ
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="flex size-11 shrink-0 items-center justify-center rounded-ui hover:bg-ink-soft"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">Fermer la recherche</span>
          </button>
        </div>
        <div className="p-5">
          <label htmlFor="recherche-site" className="sr-only">
            Termes recherchés
          </label>
          <input
            ref={input}
            id="recherche-site"
            type="search"
            autoComplete="off"
            placeholder="Exemple : franchise de TVA"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-12 w-full rounded-ui border border-border bg-sheet px-4 text-lead"
          />
          <div aria-live="polite" className="mt-3 text-small text-muted">
            {!active && "Saisissez au moins deux caractères."}
            {active && status === "loading" && "Recherche en cours…"}
            {active &&
              status === "unavailable" &&
              "La recherche sera disponible sur la version publiée du site."}
            {active &&
              status === "done" &&
              (hits.length === 0
                ? "Aucun résultat. Essayez un autre mot, ou parcourez le glossaire."
                : `${hits.length} résultat${hits.length > 1 ? "s" : ""}`)}
          </div>
          {active && status === "done" && hits.length > 0 && (
            <div className="mt-4 flex max-h-[55vh] flex-col gap-5 overflow-y-auto">
              {groups.map((type) => (
                <section key={type} aria-label={type}>
                  <h3 className="mb-2 font-sans text-small font-semibold text-muted">{type}</h3>
                  <ul className="flex flex-col gap-2">
                    {hits
                      .filter((h) => h.type === type)
                      .map((h) => (
                        <li key={h.id}>
                          <a
                            href={h.url}
                            className="block rounded-ui border border-line p-3 hover:border-ink"
                          >
                            <span className="link font-semibold">{h.title}</span>
                            <span className="mt-1 block text-small text-muted">
                              {h.excerpt.map((s, i) =>
                                s.mark ? (
                                  <mark key={i} className="bg-signal-soft text-text">
                                    {s.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{s.text}</span>
                                ),
                              )}
                            </span>
                          </a>
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
