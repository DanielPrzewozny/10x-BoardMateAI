import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: [
      "./src/components/tests/**/*.test.{ts,tsx}",
      "./src/hooks/tests/**/*.test.{ts,tsx}",
      "./src/lib/tests/**/*.test.{ts,tsx}",
      "./src/pages/api/tests/**/*.test.{ts,tsx}",
    ],
    exclude: ["./src/e2e-tests/**/*"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "src/e2e-tests/**", "**/*.d.ts"],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    watch: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
