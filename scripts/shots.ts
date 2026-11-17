// Screenshots pages of an e2e/content build in light and dark, wide and phone width.
//   pnpm shots /posts/typography-sample /tags      build, then shoot each path
//   pnpm shots --no-build /                         reuse the last build
//   pnpm shots --content content /posts/<slug>      build the real content instead
//   pnpm shots '/posts/<slug>?open=所有頁面'          open that fold first (a shot of its own)
//   pnpm shots '/posts/<slug>?open=放大圖表'          or press that button: a Lightbox is shot as the screen shows it
//   pnpm shots '/posts/<slug>?scroll=1100'           scroll to that many px first: the window as the Reader sees it there
//                                                   (no parts, sheets or crops; pass the plain path too for those)
//   pnpm shots '/posts/<slug>?at=2,5'               also shoot each Animation 2 and 5 s after it starts playing,
//                                                   cropped, in both themes at 1280px: <path>-animation-<n>-at-<s>-<theme>-1280.png
// Writes test-results/shots/<path>-<theme>-<width>.png, a crop of each visible Illustration,
// Diagram, Demo and Animation as <path>-<illustration|diagram|demo|animation>-<n>-<theme>-<width>.png (n counts from the
// top of the page), a page taller than 1,600px again as <path>-<theme>-1280-part-<n>.png, each a
// screen-sized piece an agent can read (the whole-page shot of a long Post shrinks past reading), and its
// phone parts four to an image as <path>-<theme>-375-sheet-<n>.png,
// plus index.html showing this run's shots on one page for the Owner. A shot whose bytes match last run's
// (remembered in .shots-cache/last.json) is printed with `unchanged` and tagged 與上次相同 on the sheet. Fails if a page scrolls horizontally, or if a
// box other than a code block clips its content (scrollWidth past its width), at any width.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { takeAt } from "../src/shots/at-times";
import { ShotMemory } from "../src/shots/shot-memory";
import { SITE_LANGUAGE } from "../src/site-name";

const outDir = "test-results/shots";
const themes = ["light", "dark"] as const;
const widths = [1280, 375];
/** A page taller than this is also shot in parts this tall, each starting a little above where the last ended. */
const PART_HEIGHT = 1600;
const PART_OVERLAP = 80;
/** Below this width a page's parts are joined, this many side by side, into sheets: one image to read instead of four. */
const SHEET_BELOW_WIDTH = 640;
const PARTS_PER_SHEET = 4;
/** Every Animation: a Post's (`AnimationFigure`, which also carries `data-playback`) and the home page's. */
const ANIMATION = "figure[data-animation]";
/** Mid-play shots (`?at=`) are taken at this width only: they check motion and colour, which phones share. */
const MID_PLAY_WIDTH = 1280;
/** The elements cropped from each page, named by what they are. A phone copy shows in its original's place. */
const elements = [
  { kind: "illustration", label: "插圖", selector: "span.illustration" },
  { kind: "diagram", label: "圖表", selector: "figure.mermaid-diagram" },
  { kind: "demo", label: "互動展示", selector: "figure.demo" },
  { kind: "animation", label: "示意動畫", selector: ANIMATION },
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

// Only this run's shots: one left from an earlier run would read as the page's current state.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
/** Last run's shots, so each one written the same as last time is marked and needn't be read again. */
const memory = ShotMemory.load();
/** Records `file`, just written, and says whether it has the same bytes as last run's shot of that name. */
const recordShot = (file: string) => memory.record(file.slice(outDir.length + 1), readFileSync(file));
/** What follows a shot that came out as last run's: in the printed list, and in its contact-sheet caption. */
const mark = (same: boolean) => (same ? "  unchanged" : "");
const sameTag = (same: boolean) => (same ? "（與上次相同）" : "");
const browser = await chromium.launch();
const overflowing: string[] = [];
const sections: string[] = [];
for (const path of paths) {
  // `?at=` adds mid-play shots; the path's other shots keep the names they have without it.
  const { shotPath, atTimes } = takeAt(path);
  const figures: string[] = [];
  /** Each element's crops, keyed by kind and position, in the order the page shows them. */
  const crops = new Map<string, string[]>();
  /** Adds a crop to its element's row on the contact sheet. */
  const addCrop = (key: string, name: string, label: string) =>
    crops.set(key, [
      ...(crops.get(key) ?? []),
      `<figure><figcaption>${label}</figcaption>` +
        `<a href="${name}"><img class="crop" src="${name}" alt="${path} ${label}" loading="lazy"></a></figure>`,
    ]);
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
      const url = new URL(shotPath, base);
      const labels = url.searchParams.getAll("open");
      url.searchParams.delete("open");
      // `?scroll=<px>` isn't sent either: the page is scrolled to that position before the shot, for
      // what only shows once scrolled (a sticky header's line). Reduced motion keeps the Backdrop still.
      const scrollParam = url.searchParams.get("scroll");
      const scrollTo = scrollParam === null ? 0 : Number(scrollParam);
      if (!Number.isInteger(scrollTo) || scrollTo < 0)
        throw new Error(`${path}: ?scroll= takes a whole number of px, not "${scrollParam}"`);
      url.searchParams.delete("scroll");
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
      if (scrollTo > 0) {
        // An absolute, instant scroll: wherever opening a fold left the page, and no pointer over anything.
        const reached = await page.evaluate(async (top) => {
          window.scrollTo({ top, behavior: "instant" });
          // A few frames, so what reacts to the scroll (an IntersectionObserver, then React) has rendered.
          for (let frame = 0; frame < 3; frame++) await new Promise((resolve) => requestAnimationFrame(resolve));
          return Math.round(window.scrollY);
        }, scrollTo);
        if (reached !== scrollTo)
          overflowing.push(`${path} (${theme}, ${width}px): scrolled to ${reached}px, not ${scrollTo}px`);
      }
      // An open dialog, or a scrolled page, is shot as the window shows it, not as the whole page.
      const windowOnly = dialogOpen || scrollTo > 0;
      const name = `${fileName(shotPath)}-${theme}-${width}.png`;
      const file = `${outDir}/${name}`;
      await page.screenshot({ path: file, fullPage: !windowOnly });
      const pageSame = recordShot(file);
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
              // Text clamped to a few lines ends in an ellipsis, so it reads as cut short on purpose.
              const clamped = style.webkitLineClamp !== "none";
              const downwards = !clamped && el.scrollHeight > el.clientHeight + 1 && style.overflowY !== "visible";
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
      console.log(`${response?.status()} ${file}${flagged ? "  ← overflows" : ""}${mark(pageSame)}`);
      const pageHeight = windowOnly ? 0 : await page.evaluate(() => document.documentElement.scrollHeight);
      const phoneParts: Buffer[] = [];
      for (const [index, top] of partTops(pageHeight).entries()) {
        const clip = { x: 0, y: top, width, height: Math.min(PART_HEIGHT, pageHeight - top) };
        // A phone's parts are narrow, so they are read side by side on sheets instead of one file each.
        if (width < SHEET_BELOW_WIDTH) {
          phoneParts.push(await page.screenshot({ fullPage: true, clip }));
          continue;
        }
        const partFile = `${outDir}/${fileName(shotPath)}-${theme}-${width}-part-${index + 1}.png`;
        await page.screenshot({ path: partFile, fullPage: true, clip });
        console.log(`    ${partFile}${mark(recordShot(partFile))}`);
      }
      for (let first = 0; first < phoneParts.length; first += PARTS_PER_SHEET) {
        const sheetFile = `${outDir}/${fileName(shotPath)}-${theme}-${width}-sheet-${first / PARTS_PER_SHEET + 1}.png`;
        await writeSheet(sheetFile, phoneParts.slice(first, first + PARTS_PER_SHEET), width);
        console.log(`    ${sheetFile}${mark(recordShot(sheetFile))}`);
      }
      for (const { kind, label: kindLabel, selector } of windowOnly ? [] : elements) {
        const visible = await page.locator(selector).locator("visible=true").all();
        for (const [index, element] of visible.entries()) {
          const key = `${kindLabel} ${index + 1}`;
          const cropName = `${fileName(shotPath)}-${kind}-${index + 1}-${theme}-${width}.png`;
          const cropFile = `${outDir}/${cropName}`;
          await element.screenshot({ path: cropFile });
          const cropSame = recordShot(cropFile);
          console.log(`    ${cropFile}${mark(cropSame)}`);
          const cropLabel = `${key}・${themeLabel(theme)}・${widthLabel(width)}${sameTag(cropSame)}`;
          addCrop(key, cropName, cropLabel);
        }
      }
      const label = `${themeLabel(theme)}・${widthLabel(width)}`;
      figures.push(
        `<figure><figcaption>${label}${flagged ? "（內容超出版面！）" : ""}${sameTag(pageSame)}</figcaption>` +
          `<a href="${name}"><img src="${name}" alt="${path} ${label}" loading="lazy"></a></figure>`,
      );
      await page.close();
    }
  }
  for (const theme of atTimes.length > 0 ? themes : []) {
    const target = new URL(shotPath, base);
    for (const name of ["open", "scroll"]) target.searchParams.delete(name);
    const midPlayPage = () =>
      browser.newPage({
        colorScheme: theme,
        reducedMotion: "no-preference",
        viewport: { width: MID_PLAY_WIDTH, height: 900 },
      });
    const counting = await midPlayPage();
    await counting.goto(target.href);
    const count = await counting.locator(ANIMATION).locator("visible=true").count();
    await counting.close();
    // Each Animation in a page of its own, so its clock starts when it does, not when the one above it did.
    for (let index = 0; index < count; index++) {
      const page = await midPlayPage();
      await page.goto(target.href);
      // The home page's Agent animation plays on load; a Post's waits until it is scrolled to.
      let started = Date.now();
      const animation = page.locator(ANIMATION).locator("visible=true").nth(index);
      await animation.scrollIntoViewIfNeeded();
      if ((await animation.getAttribute("data-playback")) !== null) {
        await animation.and(page.locator('[data-playback="playing"]')).waitFor({ timeout: 10_000 });
        started = Date.now();
      }
      const key = `示意動畫 ${index + 1}`;
      for (const at of atTimes) {
        await page.waitForTimeout(Math.max(0, started + at * 1000 - Date.now()));
        const midName = `${fileName(shotPath)}-animation-${index + 1}-at-${at}-${theme}-${MID_PLAY_WIDTH}.png`;
        const midFile = `${outDir}/${midName}`;
        await animation.screenshot({ path: midFile });
        const midSame = recordShot(midFile);
        console.log(`    ${midFile}${mark(midSame)}`);
        const midLabel = `${key}・第 ${at} 秒・${themeLabel(theme)}${sameTag(midSame)}`;
        addCrop(key, midName, midLabel);
      }
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
memory.save();
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

/**
 * Writes parts of a page, each `width` wide, side by side in reading order as one image.
 * Not imageGrid: parts keep their own heights and stay top-aligned, where a grid crops every tile to one shape.
 */
async function writeSheet(file: string, parts: Buffer[], width: number): Promise<void> {
  const gap = 16;
  const grey = { r: 136, g: 136, b: 136 };
  await sharp({
    create: {
      width: parts.length * width + (parts.length + 1) * gap,
      height: PART_HEIGHT + 2 * gap,
      channels: 3,
      background: grey,
    },
  })
    .composite(parts.map((input, index) => ({ input, left: gap + index * (width + gap), top: gap })))
    .png()
    .toFile(file);
}

/** Where each part of a page this tall starts; none when the whole page fits one part. */
function partTops(pageHeight: number): number[] {
  const tops: number[] = [];
  if (pageHeight <= PART_HEIGHT) return tops;
  for (let top = 0; top < pageHeight - PART_OVERLAP; top += PART_HEIGHT - PART_OVERLAP) tops.push(top);
  return tops;
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
