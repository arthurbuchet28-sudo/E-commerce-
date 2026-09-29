import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/outils");

export default function Page() {
  return <PagePlaceholder path="/outils" />;
}
