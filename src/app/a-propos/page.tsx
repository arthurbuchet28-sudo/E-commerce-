import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/a-propos");

export default function Page() {
  return <PagePlaceholder path="/a-propos" />;
}
