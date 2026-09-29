import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // `server-only` throws outside React Server Components; content loaders are tested in Node.
    coverage: {
      provider: "v8",
      include: ["src/lib/calc/**", "src/lib/parcours/progress.ts", "src/data/reference.ts"],
      exclude: ["**/*.test.ts"],
      // Tool calculations must stay fully covered (specification, section 4.5).
      thresholds: {
        "src/lib/calc/**": { statements: 100, branches: 100, functions: 100, lines: 100 },
      },
    },
    alias: { "server-only": new URL("./src/test/empty.ts", import.meta.url).pathname },
  },
});
