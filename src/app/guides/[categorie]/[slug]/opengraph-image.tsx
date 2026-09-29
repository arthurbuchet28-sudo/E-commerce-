import { getGuide, getGuides } from "@/lib/content/guides";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Aperçu du guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getGuides().map((g) => ({ categorie: g.category, slug: g.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ categorie: string; slug: string }>;
}) {
  const { categorie, slug } = await params;
  const guide = getGuide(categorie, slug);
  return renderOgImage({
    title: guide?.title ?? "Guide",
    kicker: guide ? `Guide · ${guide.categoryInfo.title}` : "Guide",
  });
}
