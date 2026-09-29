import { siteConfig } from "@/config/site";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const alt = `${siteConfig.name} : se lancer dans le e-commerce, étape par étape`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Passer de l’idée à la première vente en ligne, étape par étape",
    kicker: "Guides sourcés · Outils · Formations",
  });
}
