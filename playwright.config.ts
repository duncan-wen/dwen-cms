import { defineConfig } from "@playwright/test";

/**
 * Each checkout gets its own port (3100–3899, from a hash of its path), so smoke runs in
 * parallel worktrees don't collide. SMOKE_PORT overrides it.
 */
const port = Number(process.env.SMOKE_PORT) || 3100 + (hash(process.cwd()) % 800);

function hash(text: string): number {
  let h = 0;
  for (const char of text) h = (Math.imul(h, 31) + char.charCodeAt(0)) >>> 0;
  return h;
}

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
