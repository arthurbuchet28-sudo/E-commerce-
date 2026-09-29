import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/confidentialite");

export default function Page() {
  return <LegalDocument path="/confidentialite" slug="confidentialite" />;
}
