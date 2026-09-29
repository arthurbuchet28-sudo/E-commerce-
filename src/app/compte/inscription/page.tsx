import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/compte/inscription");

export default function Page() {
  return <PagePlaceholder path="/compte/inscription" />;
}
