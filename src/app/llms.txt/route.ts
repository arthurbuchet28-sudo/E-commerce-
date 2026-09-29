import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getGlossary } from "@/lib/content/glossary";
import { getGuides } from "@/lib/content/guides";
import { getCatalogue } from "@/lib/lms/queries";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const dynamic = "force-static";

/** llms.txt (https://llmstxt.org): a map of the site's best resources for AI assistants. */
export async function GET() {
  const courses = await getCatalogue();
  const guides = getGuides().filter((g) => !g.draft);
  const terms = getGlossary().filter((t) => !t.draft);
  const tools = routes.filter((r) => r.group === "outils" && r.path !== "/outils");

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.tagline} Guides gratuits sourcés et datés, outils de calcul, formations. Contenus informatifs en français, centrés sur le droit français et européen ; ils ne remplacent pas l’avis d’un expert-comptable ou d’un avocat.`,
    "",
    "Chaque chiffre et chaque règle cités renvoient à une source officielle, avec une date de vérification affichée sur la page.",
    "",
    "## Parcours",
    "",
    `- [Se lancer en 8 étapes](${absoluteUrl("/se-lancer")}) : de l’idée à la première vente.`,
    "",
    "## Guides",
    "",
    ...(guides.length > 0
      ? guides.map((g) => `- [${g.title}](${absoluteUrl(g.href)}) : ${g.description}`)
      : ["- Guides en cours de relecture."]),
    "",
    "## Formations",
    "",
    ...(courses.length > 0
      ? courses.map((c) => `- [${c.title}](${absoluteUrl(`/formations/${c.slug}`)}) : ${c.summary}`)
      : ["- Formations bientôt disponibles."]),
    "",
    "## Outils",
    "",
    ...tools.map((t) => `- [${t.label}](${absoluteUrl(t.path)}) : ${t.description}`),
    "",
    "## Glossaire",
    "",
    `- [Glossaire du e-commerce](${absoluteUrl("/glossaire")})`,
    ...terms.map((t) => `- [${t.term}](${absoluteUrl(t.href)}) : ${t.definition}`),
    "",
    "## Optional",
    "",
    `- [Veille réglementaire](${absoluteUrl("/veille-reglementaire")})`,
    `- [Questions fréquentes](${absoluteUrl("/faq")})`,
    `- [À propos, méthode et sources](${absoluteUrl("/a-propos")})`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
