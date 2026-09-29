import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/cookies");

export default function Page() {
  return <LegalDocument path="/cookies" slug="cookies" />;
}
