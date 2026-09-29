import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/cgu");

export default function Page() {
  return <PagePlaceholder path="/cgu" />;
}
