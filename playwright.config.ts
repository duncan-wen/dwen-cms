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
  // e2e/probe/ holds throwaway specs that measure a page (gitignored): PROBE=1 runs them alone, and smoke never does.
  testDir: process.env.PROBE ? "e2e/probe" : "e2e",
  testIgnore: process.env.PROBE ? undefined : `${import.meta.dirname}/e2e/probe/**`,
  // smoke.spec.ts is one file, so without this every test runs on one worker.
  fullyParallel: true,
  // A GitHub runner has 4 CPUs, and Playwright would use half: the tests mostly wait on the browser.
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: `pnpm start --port ${port}`,
    // The Contact form sends through a fake transport here: smoke never emails the Owner.
    env: { ...(process.env as Record<string, string>), MAIL_TRANSPORT: "fake" },
    url: `http://localhost:${port}/`,
    // A leftover server on this port may be serving an older build.
    reuseExistingServer: false,
  },
});
