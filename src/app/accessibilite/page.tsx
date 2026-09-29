import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/accessibilite");

export default function Page() {
  return <LegalDocument path="/accessibilite" slug="accessibilite" />;
}
