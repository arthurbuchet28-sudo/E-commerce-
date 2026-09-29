import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/cookies");

export default function Page() {
  return <PagePlaceholder path="/cookies" />;
}
