// Screenshots pages of an e2e/content build in light and dark, wide and phone width.
//   pnpm shots /posts/typography-sample /tags      build, then shoot each path
//   pnpm shots --no-build /                         reuse the last e2e/content build
// Writes test-results/shots/<path>-<theme>-<width>.png, plus index.html showing this
// run's shots on one page for the Owner, and fails if a page scrolls horizontally at
// phone width.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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
const sections: string[] = [];
for (const path of paths) {
  const figures: string[] = [];
  for (const theme of themes) {
    for (const width of widths) {
      const page = await browser.newPage({ colorScheme: theme, viewport: { width, height: 900 } });
      const response = await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      const name = `${fileName(path)}-${theme}-${width}.png`;
      const file = `${outDir}/${name}`;
      await page.screenshot({ path: file, fullPage: true });
      const scrolls = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      if (scrolls) overflowing.push(`${path} (${theme}, ${width}px)`);
      console.log(`${response?.status()} ${file}${scrolls ? "  ← scrolls horizontally" : ""}`);
      const label = `${theme === "light" ? "淺色" : "深色"}・${width >= 640 ? "桌機" : "手機"} ${width}px`;
      figures.push(
        `<figure><figcaption>${label}${scrolls ? "（會左右捲動！）" : ""}</figcaption>` +
          `<a href="${name}"><img src="${name}" alt="${path} ${label}" loading="lazy"></a></figure>`,
      );
      await page.close();
    }
  }
  sections.push(`<section><h2>${path}</h2><div class="row">${figures.join("")}</div></section>`);
}
await browser.close();
writeFileSync(`${outDir}/index.html`, contactSheet(sections));
console.log(`Contact sheet: ${outDir}/index.html`);

if (overflowing.length > 0) {
  console.error(`Horizontal scrolling at:\n  ${overflowing.join("\n  ")}`);
  process.exit(1);
}
process.exit(0);

function contactSheet(sections: string[]): string {
  return `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>截圖</title>
<style>
  body { margin: 24px; font: 15px/1.6 system-ui, sans-serif; background: #eee; color: #222; }
  h2 { font-size: 18px; margin: 32px 0 8px; }
  .row { display: flex; gap: 16px; align-items: flex-start; overflow-x: auto; }
  figure { margin: 0; flex: none; }
  figcaption { font-size: 13px; color: #555; margin-bottom: 4px; }
  img { display: block; border: 1px solid #ccc; width: 320px; }
  figure:has(img[alt*="375"]) img { width: 160px; }
</style>
<h1>截圖（${new Date().toLocaleString("zh-TW")}）</h1>
<p>點圖片看原尺寸。</p>
${sections.join("\n")}
</html>
`;
}

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
