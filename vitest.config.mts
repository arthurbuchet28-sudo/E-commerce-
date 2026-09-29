import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // `server-only` throws outside React Server Components; content loaders are tested in Node.
    alias: { "server-only": new URL("./src/test/empty.ts", import.meta.url).pathname },
  },
});
