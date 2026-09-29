import { LegalDocument } from "@/components/legal/LegalDocument";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/cgv");

export default function Page() {
  return <LegalDocument path="/cgv" slug="cgv" />;
}
