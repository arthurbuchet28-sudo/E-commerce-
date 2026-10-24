// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// URL publique du site : utilisée pour les liens canoniques, l'Open Graph et le sitemap.
// À adapter lors du déploiement (ou via la variable d'environnement SITE_URL).
const site = process.env.SITE_URL ?? "https://gemmes.example.com";

export default defineConfig({
  site,
  trailingSlash: "ignore",
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
