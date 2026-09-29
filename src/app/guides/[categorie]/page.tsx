import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideList } from "@/components/content/GuideList";
import { breadcrumbFor, Container, PageHeader } from "@/components/layout/PageHeader";
import { findCategory, guideCategories } from "@/data/categories";
import { getGuidesByCategory } from "@/lib/content/guides";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return guideCategories.map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/guides/[categorie]">): Promise<Metadata> {
  const category = findCategory((await params).categorie);
  if (!category) return {};
  return buildMetadata({
    title: `Guides : ${category.title}`,
    description: category.description,
    path: `/guides/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/guides/[categorie]">) {
  const category = findCategory((await params).categorie);
  if (!category) notFound();
  return (
    <Container>
      <PageHeader
        title={category.title}
        lead={category.description}
        crumbs={breadcrumbFor(`/guides/${category.slug}`, category.title)}
      />
      <GuideList
        guides={getGuidesByCategory(category.slug)}
        empty="Les guides de cette catégorie sont en cours de rédaction."
      />
    </Container>
  );
}
