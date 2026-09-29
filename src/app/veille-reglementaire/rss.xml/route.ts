import { siteConfig } from "@/config/site";
import { getVeille } from "@/lib/content/veille";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}

export function GET() {
  const items = getVeille()
    .map((e) => {
      const url = absoluteUrl(`/veille-reglementaire#${e.slug}`);
      return `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(`${e.summary} Qui est concerné : ${e.concerned}`)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Veille réglementaire · ${siteConfig.name}`)}</title>
    <link>${absoluteUrl("/veille-reglementaire")}</link>
    <atom:link href="${absoluteUrl("/veille-reglementaire/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>Les évolutions légales qui concernent les e-commerçants, datées et sourcées.</description>
    <language>fr-FR</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
