import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/cgu");

export default function Page() {
  return <LegalDocument path="/cgu" slug="cgu" />;
}
