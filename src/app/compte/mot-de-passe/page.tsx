import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/compte/mot-de-passe");

export default function Page() {
  return <PagePlaceholder path="/compte/mot-de-passe" />;
}
