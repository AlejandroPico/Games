import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Full-match simulations should not compete in one process per game suite.
    maxWorkers: 4,
    testTimeout: 15000,
  },
});
