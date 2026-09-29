import { notFound } from "next/navigation";

// Content is added in phase 4; until then every URL of this route is a 404.
export const dynamicParams = false;

export function generateStaticParams(): Array<Record<"terme", string>> {
  return [];
}

export default function Page() {
  notFound();
}
