import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/mentions-legales");

export default function Page() {
  return <LegalDocument path="/mentions-legales" slug="mentions-legales" />;
}
