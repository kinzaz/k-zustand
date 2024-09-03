import { resolve } from "path";
// eslint-disable-next-line import/extensions
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^k-zustand$/, replacement: resolve("./src/index.ts") },
      { find: /^k-zustand(.*)$/, replacement: resolve("./src/$1.ts") },
    ],
  },
  test: {
    name: "k-zustand",
    // Keeping globals to true triggers React Testing Library's auto cleanup
    // https://vitest.dev/guide/migration.html
    globals: true,
    environment: "jsdom",
    dir: "tests",
    reporters: "basic",
    coverage: {
      reporter: ["text", "json", "html", "text-summary"],
      reportsDirectory: "./coverage/",
    },
  },
});
