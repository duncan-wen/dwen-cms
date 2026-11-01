import { defineConfig } from "@playwright/test";

const port = 3100;

/** Smoke tests run against a production build of e2e/content: `pnpm smoke` builds, then tests. */
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: `pnpm start --port ${port}`,
    url: `http://localhost:${port}/`,
    // A leftover server on this port may be serving an older build.
    reuseExistingServer: false,
  },
});
