// @vitest-environment node
import fs from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Info, legalComponents, legalInfo } from "@/components/legal/LegalComponents";
import { mdxComponents } from "@/components/mdx/components";
import { CGU_VERSION, CGV_VERSION } from "@/config/legal";
import { processors, treatments } from "@/data/privacy";

import { getLegalPage, LEGAL_SLUGS } from "./legal";
import { renderMdx } from "./mdx";

describe("legal pages", () => {
  it.each(LEGAL_SLUGS)("%s renders with its injected values", async (slug) => {
    const { data, body } = getLegalPage(slug);
    const html = renderToStaticMarkup(
      await renderMdx(body, { ...mdxComponents(data.sources), ...legalComponents }),
    );
    expect(html.length).toBeGreaterThan(800);
    const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ");
    expect(text, slug).not.toMatch(/[^\s  ] [:;!?](?=\s|$)/m);
  });

  it("CGV and CGU versions match the versions recorded at checkout and sign-up", () => {
    expect(getLegalPage("cgv").data.version).toBe(CGV_VERSION);
    expect(getLegalPage("cgu").data.version).toBe(CGU_VERSION);
  });

  it("templates stay flagged until validated", () => {
    for (const slug of LEGAL_SLUGS) expect(getLegalPage(slug).data.status, slug).toBe("trame");
  });

  it("refuses unknown injected values", () => {
    expect(() => Info({ cle: "inconnu" })).toThrow(/Unknown legal info/);
    expect(legalInfo["editeur.tva"]).toContain("franchise en base");
  });

  it("the legal notice names the host and the CGV never promise a certification", () => {
    const cgv = getLegalPage("cgv").body;
    expect(cgv).toMatch(/ni un diplôme\s+ni une certification/);
    expect(cgv).not.toMatch(/éligible (au )?CPF/i);
    expect(getLegalPage("mentions-legales").body).toContain('<Info cle="hebergeur.nom" />');
  });
});

describe("processing register", () => {
  const register = fs.readFileSync("docs/registre-traitements.md", "utf8");

  it("lists every processing activity of the privacy policy", () => {
    for (const t of treatments) expect(register, t.id).toContain(`\`${t.id}\``);
  });

  it("refers only to declared processors", () => {
    const ids = new Set(processors.map((p) => p.id));
    for (const t of treatments) for (const p of t.processors) expect(ids.has(p), p).toBe(true);
  });
});
