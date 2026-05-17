import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: true,
      include: [
        "app/page.tsx",
        "app/dashboard/page.tsx",
        "app/providers.tsx",
        "components/**/*.tsx",
        "lib/**/*.ts",
        "lib/**/*.tsx",
      ],
      exclude: ["app/layout.tsx"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
