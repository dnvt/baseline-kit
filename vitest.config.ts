import { defineConfig } from "vitest/config";
import { resolve } from "path";

// Define aliases directly here to ensure they're properly resolved
const alias = {
  "@utils": resolve(__dirname, "src/utils"),
  "@hooks": resolve(__dirname, "src/hooks"),
  "@components": resolve(__dirname, "src/components"),
  "@context": resolve(__dirname, "src/context"),
  "@types": resolve(__dirname, "src/types"),
};

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "json", "html"],
      exclude: [
        "demo/**/*",
        "tests/**/*",
        "src/**/index.ts",
        "node_modules/**/*",
        "**/*.d.ts",
        "**/*.js",
        ".eslintrc.cjs",
        "index.ts",
        "vite.config.mts",
        "vitest.config.ts",
        "alias.config.ts",
      ],
    },
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    typecheck: {
      tsconfig: "./vitest.tsconfig.json",
    },
  },
  resolve: { alias },
});
