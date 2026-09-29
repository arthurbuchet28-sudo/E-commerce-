import { siteConfig } from "@/config/site";

// Temporary placeholder: the real home page is built in phases 2–4.
export default function Home() {
  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-16"
    >
      <h1 className="text-3xl font-semibold">{siteConfig.name}</h1>
      <p className="text-lg">{siteConfig.tagline}</p>
      <p>Site en construction.</p>
    </main>
  );
}
