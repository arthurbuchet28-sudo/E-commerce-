import { notFound } from "next/navigation";

// Content is added in phase 8; until then every URL of this route is a 404.
export const dynamicParams = false;

export function generateStaticParams(): Array<Record<"formation" | "lecon", string>> {
  return [];
}

export default function Page() {
  notFound();
}
