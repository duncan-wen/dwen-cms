// Screenshots pages of an e2e/content build in light and dark, wide and phone width.
//   pnpm shots /posts/typography-sample /tags      build, then shoot each path
//   pnpm shots --no-build /                         reuse the last build
//   pnpm shots --content content /posts/<slug>      build the real content instead
//   pnpm shots '/posts/<slug>?open=所有頁面'          open that fold first (a shot of its own)
//   pnpm shots '/posts/<slug>?open=放大圖表'          or press that button: a Lightbox is shot as the screen shows it
// Writes test-results/shots/<path>-<theme>-<width>.png, a crop of each visible Illustration,
// Diagram and Demo as <path>-<illustration|diagram|demo>-<n>-<theme>-<width>.png (n counts from the
// top of the page), plus index.html showing this run's shots on one page for the Owner. Fails if a page scrolls horizontally, or if a
// box other than a code block clips its content (scrollWidth past its width), at any width.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { chromium } from "@playwright/test";
import { SITE_LANGUAGE } from "../src/site-name";

const outDir = "test-results/shots";
const themes = ["light", "dark"] as const;
const widths = [1280, 375];
/** The elements cropped from each page, named by what they are. A phone copy shows in its original's place. */
const elements = [
  { kind: "illustration", label: "插圖", selector: "span.illustration" },
  { kind: "diagram", label: "圖表", selector: "figure.mermaid-diagram" },
  { kind: "demo", label: "互動展示", selector: "figure.demo" },
] as const;

const args = process.argv.slice(2);
const build = !args.includes("--no-build");
const contentIndex = args.indexOf("--content");
const contentDir = contentIndex === -1 ? "e2e/content" : args[contentIndex + 1];
const contentArgs = contentIndex === -1 ? [] : [contentIndex, contentIndex + 1];
const paths = args.filter((arg, i) => arg !== "--no-build" && !contentArgs.includes(i));
if (paths.length === 0) paths.push("/");

if (build) {
  const result = spawnSync("pnpm", ["build"], {
    stdio: "inherit",
    env: { ...process.env, CONTENT_DIR: contentDir },
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
  /** Each element's crops, keyed by kind and position, in the order the page shows them. */
  const crops = new Map<string, string[]>();
  for (const theme of themes) {
    for (const width of widths) {
      // Reduced motion, so an animation shows its finished frame rather than wherever it was when the shot was taken.
      const page = await browser.newPage({
        colorScheme: theme,
        reducedMotion: "reduce",
        viewport: { width, height: 900 },
      });
      // `?open=<label>` isn't sent: it names a fold (<summary>) to open before the shot, or,
      // when no fold has that label, the first visible button named so, such as 放大圖表.
      const url = new URL(path, base);
      const labels = url.searchParams.getAll("open");
      url.searchParams.delete("open");
      const response = await page.goto(url.href);
      // A button named exactly so wins over a fold whose text merely contains the label. A
      // Lightbox covers the page, so its button belongs last among the labels.
      for (const label of labels) {
        const button = page.getByRole("button", { name: label, exact: true }).locator("visible=true");
        const pressed = (await button.count()) > 0;
        const target = pressed ? button.first() : page.locator("summary", { hasText: label });
        await target.click({ timeout: 5_000 }).catch(() => {
          throw new Error(`${path}: nothing visible at ${width}px is a button or fold named "${label}"`);
        });
        if (pressed)
          await page
            .locator("dialog[open]")
            .waitFor({ timeout: 2_000 })
            .catch(() => undefined);
      }
      // An open dialog covers the page, so it's shot as the screen shows it, and only it is checked for clipping.
      const dialogOpen = (await page.locator("dialog[open]").count()) > 0;
      await page.evaluate(() => document.fonts.ready);
      // A full-page shot never scrolls, so lazy images and frames (a Demo) below the fold would stay
      // blank: load them all now and wait until each image has decoded and each frame has loaded.
      const unloadedFrames = await page.evaluate(async () => {
        const images = [...document.images];
        for (const image of images) image.loading = "eager";
        const frames = [...document.querySelectorAll("iframe")];
        // Inline, not a named helper: tsx wraps named functions in a `__name` the page doesn't have.
        const loaded = frames
          .filter((frame) => frame.contentDocument?.readyState !== "complete")
          .map(
            (frame) => new Promise((resolve) => (frame.addEventListener("load", resolve), setTimeout(resolve, 10_000))),
          );
        for (const frame of frames) frame.loading = "eager";
        await Promise.all([...images.map((image) => image.decode().catch(() => undefined)), ...loaded]);
        return frames
          .filter((frame) => frame.contentDocument?.readyState !== "complete")
          .map((frame) => frame.getAttribute("src"));
      });
      for (const src of unloadedFrames)
        overflowing.push(`${path} (${theme}, ${width}px): the frame ${src} didn't load`);
      const name = `${fileName(path)}-${theme}-${width}.png`;
      const file = `${outDir}/${name}`;
      await page.screenshot({ path: file, fullPage: !dialogOpen });
      const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (scrolls) overflowing.push(`${path} (${theme}, ${width}px): the page scrolls horizontally`);
      // A Demo is its own page in a frame: it mustn't scroll sideways inside the frame either.
      const scrollingFrames = await page.evaluate(() =>
        [...document.querySelectorAll("iframe")]
          .filter((frame) => {
            const root = frame.contentDocument?.documentElement;
            return root !== undefined && root.scrollWidth > root.clientWidth + 1;
          })
          .map((frame) => frame.getAttribute("src")),
      );
      for (const src of scrollingFrames)
        overflowing.push(`${path} (${theme}, ${width}px): the frame ${src} scrolls horizontally`);
      // A box that clips its content shows it cut off in a screenshot: sideways (only code blocks may scroll),
      // or downwards (an animation's frame cuts off what doesn't fit).
      const clipped = await page.evaluate(
        (dialogOpen) =>
          (dialogOpen
            ? [document.querySelector("dialog[open]")!, ...document.querySelectorAll("dialog[open] *")]
            : [...document.body.querySelectorAll("*")]
          )
            // Code blocks may scroll; text kept for screen readers alone (`sr-only`) is clipped to nothing on purpose.
            .filter((el) => !el.closest("pre") && !el.closest(".sr-only"))
            .filter((el) => {
              const style = getComputedStyle(el);
              const sideways = el.scrollWidth > el.clientWidth + 1 && style.overflowX !== "visible";
              const downwards = el.scrollHeight > el.clientHeight + 1 && style.overflowY !== "visible";
              return sideways || downwards;
            })
            .map(
              (el) =>
                `<${el.tagName.toLowerCase()}${el.className ? ` class="${String(el.className).slice(0, 60)}"` : ""}>`,
            ),
        dialogOpen,
      );
      for (const box of clipped) overflowing.push(`${path} (${theme}, ${width}px): ${box} clips its content`);
      const flagged = scrolls || clipped.length > 0 || scrollingFrames.length > 0 || unloadedFrames.length > 0;
      console.log(`${response?.status()} ${file}${flagged ? "  ← overflows" : ""}`);
      for (const { kind, label: kindLabel, selector } of dialogOpen ? [] : elements) {
        const visible = await page.locator(selector).locator("visible=true").all();
        for (const [index, element] of visible.entries()) {
          const key = `${kindLabel} ${index + 1}`;
          const cropName = `${fileName(path)}-${kind}-${index + 1}-${theme}-${width}.png`;
          await element.screenshot({ path: `${outDir}/${cropName}` });
          console.log(`    ${outDir}/${cropName}`);
          const cropLabel = `${key}・${themeLabel(theme)}・${widthLabel(width)}`;
          crops.set(key, [
            ...(crops.get(key) ?? []),
            `<figure><figcaption>${cropLabel}</figcaption>` +
              `<a href="${cropName}"><img class="crop" src="${cropName}" alt="${path} ${cropLabel}" loading="lazy"></a></figure>`,
          ]);
        }
      }
      const label = `${themeLabel(theme)}・${widthLabel(width)}`;
      figures.push(
        `<figure><figcaption>${label}${flagged ? "（內容超出版面！）" : ""}</figcaption>` +
          `<a href="${name}"><img src="${name}" alt="${path} ${label}" loading="lazy"></a></figure>`,
      );
      await page.close();
    }
  }
  const cropRows = [...crops.values()].map((row) => `<div class="row">${row.join("")}</div>`);
  sections.push(
    `<section><h2>${path}</h2><div class="row">${figures.join("")}</div>` +
      (cropRows.length > 0 ? `<h3>插圖、圖表與互動展示</h3>${cropRows.join("")}` : "") +
      `</section>`,
  );
}
await browser.close();
writeFileSync(`${outDir}/index.html`, contactSheet(sections));
console.log(`Contact sheet: ${outDir}/index.html`);

if (overflowing.length > 0) {
  console.error(`Overflow:\n  ${overflowing.join("\n  ")}`);
  process.exit(1);
}
process.exit(0);

function contactSheet(sections: string[]): string {
  return `<!doctype html><html lang="${SITE_LANGUAGE}"><meta charset="utf-8"><title>截圖</title>
<style>
  body { margin: 24px; font: 15px/1.6 system-ui, sans-serif; background: #eee; color: #222; }
  h2 { font-size: 18px; margin: 32px 0 8px; }
  h3 { font-size: 15px; margin: 24px 0 8px; }
  .row { display: flex; gap: 16px; align-items: flex-start; overflow-x: auto; margin-bottom: 16px; }
  figure { margin: 0; flex: none; }
  figcaption { font-size: 13px; color: #555; margin-bottom: 4px; }
  img { display: block; border: 1px solid #ccc; width: 320px; }
  figure:has(img[alt*="375"]) img { width: 160px; }
  /* Crops show at their own size, so labels read as they do on the page; a wide one shrinks to fit a row of four. */
  img.crop, figure:has(img[alt*="375"]) img.crop { width: auto; max-width: 400px; }
</style>
<h1>截圖（${new Date().toLocaleString("zh-TW")}）</h1>
<p>點圖片看原尺寸。</p>
${sections.join("\n")}
</html>
`;
}

function themeLabel(theme: (typeof themes)[number]): string {
  return theme === "light" ? "淺色" : "深色";
}

function widthLabel(width: number): string {
  return `${width >= 640 ? "桌機" : "手機"} ${width}px`;
}

/** A path as a file name; each Chinese `?open=` label becomes its code points, so two labels never share a name. */
function fileName(path: string): string {
  const ascii = path.replace(/[^\x00-\x7f]/g, (char) => char.codePointAt(0)!.toString(16));
  return ascii.replace(/^\/|\/$/g, "").replace(/[^\w-]+/g, "_") || "home";
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
