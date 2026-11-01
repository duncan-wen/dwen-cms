// Screenshots pages of an e2e/content build in light and dark, wide and phone width.
//   pnpm shots /posts/typography-sample /tags      build, then shoot each path
//   pnpm shots --no-build /                         reuse the last e2e/content build
// Writes test-results/shots/<path>-<theme>-<width>.png and fails if a page scrolls
// horizontally at phone width.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createServer } from "node:net";
import { chromium } from "@playwright/test";

const outDir = "test-results/shots";
const themes = ["light", "dark"] as const;
const widths = [1280, 375];

const args = process.argv.slice(2);
const build = !args.includes("--no-build");
const paths = args.filter((arg) => arg !== "--no-build");
if (paths.length === 0) paths.push("/");

if (build) {
  const result = spawnSync("pnpm", ["build"], {
    stdio: "inherit",
    env: { ...process.env, CONTENT_DIR: "e2e/content" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const port = await freePort();
// Own process group, so stopping it also stops next's child processes.
const server = spawn("node_modules/.bin/next", ["start", "--port", String(port)], {
  detached: true,
  stdio: "ignore",
});
const stopServer = () => {
  if (server.exitCode === null && server.pid) process.kill(-server.pid, "SIGTERM");
};
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));

const base = `http://localhost:${port}`;
await waitUntilUp(base);

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const overflowing: string[] = [];
for (const path of paths) {
  for (const theme of themes) {
    for (const width of widths) {
      const page = await browser.newPage({ colorScheme: theme, viewport: { width, height: 900 } });
      const response = await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      const file = `${outDir}/${fileName(path)}-${theme}-${width}.png`;
      await page.screenshot({ path: file, fullPage: true });
      const scrolls = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      if (scrolls) overflowing.push(`${path} (${theme}, ${width}px)`);
      console.log(`${response?.status()} ${file}${scrolls ? "  ← scrolls horizontally" : ""}`);
      await page.close();
    }
  }
}
await browser.close();

if (overflowing.length > 0) {
  console.error(`Horizontal scrolling at:\n  ${overflowing.join("\n  ")}`);
  process.exit(1);
}
process.exit(0);

function fileName(path: string): string {
  return path.replace(/^\/|\/$/g, "").replace(/[^\w-]+/g, "_") || "home";
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, () => {
      const address = probe.address();
      probe.close(() => (typeof address === "object" && address ? resolve(address.port) : reject()));
    });
  });
}

async function waitUntilUp(url: string): Promise<void> {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`next start exited with ${server.exitCode}`);
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`next start did not answer at ${url} within 30s`);
}
