import { expect, type Locator, type Page, test } from "@playwright/test";

// Smoke tests run against a build of e2e/content, never the real content.

test("a Published Post answers 200 with its title", async ({ request }) => {
  const response = await request.get("/posts/smoke-post");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("煙霧測試文章");
});

test("a Published Post's cover answers 200 as an SVG file", async ({ request }) => {
  const response = await request.get("/covers/smoke-post.svg");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
  expect(await response.text()).toContain("<path");
});

test("a Post's co-located image answers 200 with its image type", async ({ request }) => {
  const response = await request.get("/posts/typography-sample/flow.png");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test("a file next to a Post that no Post uses as an image answers 404", async ({ request }) => {
  const response = await request.get("/posts/typography-sample/index.mdx");

  expect(response.status()).toBe(404);
});

test("a body image loads optimised, its box sized from the image before it loads", async ({
  page,
}) => {
  await page.goto("/posts/typography-sample");
  const image = page.getByRole("img", { name: "草稿經過審閱才發布的流程圖" });

  await expect(image).toHaveAttribute("width", "1200");
  await expect(image).toHaveAttribute("height", "600");
  await expect(image).toHaveAttribute("src", /^\/_next\/image\?url=%2Fposts%2Ftypography-sample%2Fflow\.png/);
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

const imageLink = (page: Page) => page.getByRole("link", { name: "放大圖片：草稿經過審閱才發布的流程圖" });

/** The Lightbox loads the original file only on opening, and an image that hasn't loaded yet is 0px wide. */
async function loadedBox(image: Locator) {
  await expect(image).toHaveJSProperty("complete", true);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  return (await image.boundingBox())!;
}

test.describe("an Illustration", () => {
  const alt = "兩條執行緒輪流取得 GIL 的時間軸，任何時刻只有一條在執行";

  test("is inlined, painted with the theme's colour tokens", async ({ page }) => {
    await page.goto("/posts/typography-sample");

    const drawing = page.getByRole("img", { name: alt }).first();
    await expect(drawing.locator("svg rect").first()).toHaveAttribute("fill", /^var\(--/);
  });

  test("shows its upright phone copy on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/posts/typography-sample");

    const visible = page.getByRole("img", { name: alt }).locator("visible=true");
    await expect(visible).toHaveCount(1);
    await expect(visible.locator("svg")).toHaveAttribute("viewBox", "0 0 340 480");
  });

  test("opens in a Lightbox", async ({ page }) => {
    await page.goto("/posts/typography-sample");
    await page.getByRole("link", { name: `放大圖片：${alt}` }).click();

    await expect(page.getByRole("dialog").getByRole("img", { name: alt }).locator("visible=true")).toHaveCount(1);
  });

  test("opened on its own, defines its colour tokens itself", async ({ request }) => {
    const response = await request.get("/posts/typography-sample/gil.svg");

    expect(response.headers()["content-type"]).toContain("image/svg+xml");
    expect(await response.text()).toMatch(/<style>:root\{[^}]*--series-1:/);
  });
});

test.describe("a body image's Lightbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/posts/typography-sample");
  });

  test("opens on click with the original file, the close button focused", async ({ page }) => {
    await imageLink(page).click();

    const lightbox = page.getByRole("dialog");
    await expect(lightbox.getByRole("img")).toHaveAttribute("src", "/posts/typography-sample/flow.png");
    await expect(lightbox.getByRole("button", { name: "關閉" })).toBeFocused();
    expect(new URL(page.url()).pathname).toBe("/posts/typography-sample");
  });

  for (const [how, close] of [
    ["Esc", (page: Page) => page.keyboard.press("Escape")],
    ["the close button", (page: Page) => page.getByRole("button", { name: "關閉" }).click()],
    ["the image", (page: Page) => page.getByRole("dialog").getByRole("img").click()],
    ["the background", (page: Page) => page.mouse.click(2, page.viewportSize()!.height - 2)],
  ] as const) {
    test(`closes with ${how}, handing focus back to the image`, async ({ page }) => {
      await imageLink(page).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      await close(page);

      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(imageLink(page)).toBeFocused();
    });
  }

  test("fits a small viewport without scrolling sideways, keeping the image's shape", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await imageLink(page).click();

    const box = await loadedBox(page.getByRole("dialog").getByRole("img"));

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
    expect(box.width / box.height).toBeCloseTo(2, 1); // flow.png is 1200×600
  });

  test("fits a short viewport too, keeping the image's shape", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await imageLink(page).click();

    const box = await loadedBox(page.getByRole("dialog").getByRole("img"));

    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(400);
    expect(box.width / box.height).toBeCloseTo(2, 1); // flow.png is 1200×600
  });

  test("never enlarges an image past its own size", async ({ page }) => {
    await page.setViewportSize({ width: 1800, height: 1000 });
    await imageLink(page).click();

    const box = await loadedBox(page.getByRole("dialog").getByRole("img"));

    expect(box.width).toBe(1200);
  });

  test("holds the page still behind it", async ({ page }) => {
    await imageLink(page).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const before = await page.evaluate(() => window.scrollY);

    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(100);

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("stays closed on a modified click, which opens the file in a new tab", async ({ page, context }) => {
    const newTab = context.waitForEvent("page");

    await imageLink(page).click({ modifiers: ["ControlOrMeta"] });

    // The new tab starts at about:blank before it reaches the file.
    await expect(await newTab).toHaveURL(/\/posts\/typography-sample\/flow\.png$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a body image links to its original file", async ({ page }) => {
    await page.goto("/posts/typography-sample");

    await expect(imageLink(page)).toHaveAttribute("href", "/posts/typography-sample/flow.png");
  });
});

test("a Post with a cover image opens with it instead of the generated cover", async ({ page }) => {
  await page.goto("/posts/last-year-smoke-post");
  const cover = page.locator("article img").first();

  await expect(cover).toHaveAttribute("src", /url=%2Fposts%2Flast-year-smoke-post%2Fcover\.jpg/);
  await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test("code blocks colour their tokens with the theme's code colours", async ({ page }) => {
  await page.goto("/posts/typography-sample");
  const keyword = page.locator("pre code span", { hasText: /^export$/ }).first();

  const [colour, token] = await keyword.evaluate((span) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--code-keyword)";
    document.body.append(probe);
    return [getComputedStyle(span).color, getComputedStyle(probe).color];
  });
  expect(colour).toBe(token);
});

test("a mermaid block draws an SVG diagram whose colours follow the theme toggle without a reload", async ({
  browser,
}) => {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.goto("/posts/typography-sample");
  const node = page.locator("article figure svg g.node", { hasText: "審閱" }).locator("polygon, rect").first();
  /** The node's fill and text colours, next to the colour tokens they should be. */
  const colours = () =>
    node.evaluate((shape) => {
      const token = (name: string) => {
        const probe = document.createElement("span");
        probe.style.color = `var(${name})`;
        document.body.append(probe);
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      };
      const text = shape.parentElement!.querySelector("text")!;
      return {
        fill: getComputedStyle(shape).fill,
        text: getComputedStyle(text).fill,
        expected: { fill: token("--accent-wash"), text: token("--ink") },
      };
    });

  await expect(page.locator("article pre", { hasText: "flowchart" })).toHaveCount(0);
  const light = await colours();
  expect([light.fill, light.text]).toEqual([light.expected.fill, light.expected.text]);

  await page.getByRole("banner").getByRole("button", { name: "切換深淺色" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const dark = await colours();
  expect([dark.fill, dark.text]).toEqual([dark.expected.fill, dark.expected.text]);
  expect(dark.fill).not.toBe(light.fill);
  await page.close();
});

test("on a phone a sideways flowchart is drawn top-down and fits the column", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/posts/typography-sample");
  const shown = page.locator("article figure:visible", { hasText: "靜態頁面" });

  await expect(shown).toHaveCount(1);
  const [width, height, scrollWidth, clientWidth] = await shown.evaluate((figure) => {
    const box = figure.querySelector("svg")!.getBoundingClientRect();
    return [box.width, box.height, figure.scrollWidth, figure.clientWidth];
  });
  expect(height).toBeGreaterThan(width);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("on a desktop a sideways flowchart too wide for the column is drawn top-down too", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/posts/typography-sample");
  const shown = page.locator("article figure:visible", { hasText: "靜態頁面" });

  await expect(shown).toHaveCount(1);
  const [width, height] = await shown.evaluate((figure) => {
    const box = figure.querySelector("svg")!.getBoundingClientRect();
    return [box.width, box.height];
  });
  expect(height).toBeGreaterThan(width);
  const [scrollWidth, clientWidth] = await shown.evaluate((figure) => [figure.scrollWidth, figure.clientWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("a Callout shows its title and content in the Post", async ({ page }) => {
  await page.goto("/posts/typography-sample");
  const callout = page.locator("article aside", { hasText: "提示框裡可以放一般內文" });

  await expect(callout).toBeVisible();
  await expect(callout).toContainText("注意");
});

test("a table shows its header and rows in the Post, its borders in the theme's rule colour", async ({ page }) => {
  await page.goto("/posts/typography-sample");
  const table = page.locator("article table");

  await expect(table.locator("thead th")).toHaveText(["風格", "畫法", "產圖時間", "適合"]);
  await expect(table.locator("tbody tr")).toHaveCount(2);
  const rule = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--rule").trim());
  const border = await table.locator("thead").evaluate((el) => getComputedStyle(el).borderBottomColor);
  expect(border).toBe(await page.evaluate((hex) => {
    const probe = document.createElement("div");
    probe.style.color = hex;
    document.body.append(probe);
    return getComputedStyle(probe).color;
  }, rule));
});

test("the Post list answers 200 and links to a Published Post and its Tags", async ({
  request,
}) => {
  const response = await request.get("/posts");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/smoke-post"');
  expect(html).toContain('href="/tags/smoke"');
});

test("the home page answers 200, shows the latest Posts and links to the Post list", async ({
  request,
}) => {
  const response = await request.get("/");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/smoke-post"');
  expect(html).toContain('href="/posts"');
});

test("the Tag index answers 200 and links to each Tag's page", async ({ request }) => {
  const response = await request.get("/tags");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/tags/smoke"');
});

test("a Tag's page answers 200 and links to its Posts", async ({ request }) => {
  const response = await request.get("/tags/smoke");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('href="/posts/smoke-post"');
});

test("a Post page links to its Tags", async ({ request }) => {
  const response = await request.get("/posts/smoke-post");

  expect(await response.text()).toContain('href="/tags/smoke"');
});

test("a Post with a Revision shows 「更新於」 with the Revision's note", async ({ request }) => {
  const html = await (await request.get("/posts/revised-smoke-post")).text();

  expect(html).toContain("更新於");
  expect(html).toContain("補上第二個段落");
});

test("a Post without a Revision shows no 「更新於」", async ({ request }) => {
  const html = await (await request.get("/posts/smoke-post")).text();

  expect(html).not.toContain("更新於");
});

test("a Post with h2 headings has a table of contents linking to each heading's id", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/posts/typography-sample");
  const toc = page.getByRole("navigation", { name: "本文目錄" });

  await expect(toc).toBeVisible();
  for (const name of ["清單", "程式碼與引言"]) {
    const href = await toc.getByRole("link", { name }).getAttribute("href");
    expect(href, name).toMatch(/^#/);
    const heading = page.locator(`h2[id="${decodeURIComponent(href!.slice(1))}"]`);
    await expect(heading, name).toHaveText(name);
  }
});

test("a Post without h2 headings has no table of contents", async ({ page }) => {
  await page.goto("/posts/smoke-post");

  await expect(page.getByRole("navigation", { name: "本文目錄" })).toHaveCount(0);
});

test("a Post ends with a colophon signed by the Owner with the long Chinese date", async ({
  request,
}) => {
  const html = await (await request.get("/posts/typography-sample")).text();

  expect(html).toContain("寫於");
  expect(html).toContain("2026年9月1日");
});

test("the About page answers 200 with its Page content and the AI disclosure", async ({
  request,
}) => {
  const response = await request.get("/about");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("關於煙霧測試");
  expect(html).toContain("這個關於頁只給煙霧測試使用。");
  expect(html).toContain("由 AI 協助撰寫");
});

test("the home page links to the About page", async ({ request }) => {
  const html = await (await request.get("/")).text();

  expect(html).toContain('href="/about"');
});

test("the home page's 「聯絡我」 links to the About page's contact section", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(main.getByRole("link", { name: "聯絡我", exact: true })).toHaveAttribute(
    "href",
    "/about#contact",
  );
  await expect(main).not.toContainText("→");
});

test("the Post list groups Posts under year headings, newest year first", async ({ page }) => {
  await page.goto("/posts");
  const years = page.getByRole("main").getByRole("heading", { level: 2 });

  await expect(years).toHaveText(["2026", "2025"]);
  const lastYear = page.getByRole("region", { name: "2025 年" });
  await expect(lastYear.getByRole("link", { name: "去年的煙霧測試文章" })).toHaveAttribute(
    "href",
    "/posts/last-year-smoke-post",
  );
  await expect(lastYear.locator("time")).toHaveText("12-20");
});

test("an unknown Tag answers 404", async ({ request }) => {
  const response = await request.get("/tags/no-such-tag");

  expect(response.status()).toBe(404);
});

test("a previous Slug permanently redirects to the Post's current URL", async ({ request }) => {
  const response = await request.get("/posts/old-smoke-post", { maxRedirects: 0 });

  expect([301, 308]).toContain(response.status());
  expect(response.headers()["location"]).toBe("/posts/smoke-post");
});

test("a taken-down Slug answers 410 with an explanation and a link to the Post list", async ({
  request,
}) => {
  const response = await request.get("/posts/taken-down-post");

  expect(response.status()).toBe(410);
  const html = await response.text();
  expect(html).toContain("這篇文章已移除");
  expect(html).toContain('href="/posts"');
});

test("the header links home and to 文章, 標籤 and 關於, and each link resolves", async ({
  page,
  request,
}) => {
  await page.goto("/posts/smoke-post");
  const header = page.getByRole("banner");

  await expect(header.getByRole("link", { name: "Duncan Wen" })).toHaveAttribute("href", "/");
  const nav = header.getByRole("navigation", { name: "主要" });
  for (const [name, href] of [
    ["文章", "/posts"],
    ["標籤", "/tags"],
    ["關於", "/about"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
    expect((await request.get(href)).status()).toBe(200);
  }
});

test("the header marks the section the page belongs to", async ({ page }) => {
  for (const [path, section] of [
    ["/posts", "文章"],
    ["/posts/smoke-post", "文章"],
    ["/tags/smoke", "標籤"],
    ["/about", "關於"],
  ]) {
    await page.goto(path);
    const current = page.getByRole("navigation", { name: "主要" }).locator('[aria-current="page"]');
    await expect(current, path).toHaveText(section);
  }
});

test("the footer links to GitHub, Email, LinkedIn and RSS", async ({ page }) => {
  await page.goto("/no-such-url");
  const footer = page.getByRole("contentinfo");

  await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
  for (const [name, href] of [
    ["GitHub", "https://github.com/duncan-wen"],
    ["lumpa7223@gmail.com", "mailto:lumpa7223@gmail.com"],
    ["LinkedIn", "https://www.linkedin.com/in/duncan-wen"],
    ["RSS", "/feed.xml"],
  ]) {
    await expect(footer.getByRole("link", { name })).toHaveAttribute("href", href);
  }
});

test("the About page's #contact section lists the same contact links as the footer", async ({
  page,
}) => {
  await page.goto("/about");
  const hrefs = (scope: Locator) =>
    scope.getByRole("link").evaluateAll((links) => links.map((a) => a.getAttribute("href")));

  const contact = await hrefs(page.locator("#contact"));
  expect(contact).toContain("mailto:lumpa7223@gmail.com");
  expect(contact).toEqual(await hrefs(page.getByRole("contentinfo")));
});

/** The `<loc>`/`<link>` URLs of an XML document, as paths, in document order. */
const paths = (xml: string, tag: string) =>
  [...xml.matchAll(new RegExp(`<${tag}>([^<]*)</${tag}>`, "g"))].map((m) => new URL(m[1]).pathname);

test("the RSS feed answers as RSS and lists Published Posts newest first, and no Pages", async ({
  request,
}) => {
  const response = await request.get("/feed.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].map((m) => paths(m[0], "link")[0]);
  expect(items).toEqual([
    "/posts/smoke-post",
    "/posts/revised-smoke-post",
    "/posts/typography-sample",
    "/posts/last-year-smoke-post",
  ]);
  expect(xml).toContain("煙霧測試文章");
  expect(xml).not.toContain("/about");
});

test("the sitemap answers as XML and lists every Published Post, Page and Tag page, and no taken-down or previous Slugs", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  const locs = paths(await response.text(), "loc");
  for (const path of [
    "/",
    "/posts",
    "/posts/smoke-post",
    "/posts/revised-smoke-post",
    "/posts/typography-sample",
    "/posts/last-year-smoke-post",
    "/about",
    "/tags",
    "/tags/smoke",
  ]) {
    expect(locs, path).toContain(path);
  }
  expect(locs).not.toContain("/posts/taken-down-post");
  expect(locs).not.toContain("/posts/old-smoke-post");
});

test("every page sets a canonical URL on the configured base URL", async ({ page }) => {
  for (const path of [
    "/",
    "/posts",
    "/posts/smoke-post",
    "/tags",
    "/tags/smoke",
    "/about",
  ]) {
    await page.goto(path);

    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute(
      "href",
      // `pnpm smoke` builds with SITE_URL=https://dwen.example.
      `https://dwen.example${path === "/" ? "" : path}`,
    );
  }
});

test("a Post's social preview image answers as a 1200×630 PNG", async ({ page, request }) => {
  await page.goto("/posts/smoke-post");
  const og = (property: string) =>
    page.locator(`meta[property="${property}"]`).getAttribute("content");

  expect(await og("og:image:width")).toBe("1200");
  expect(await og("og:image:height")).toBe("630");
  const image = new URL((await og("og:image"))!);
  expect(image.origin).toBe("https://dwen.example");
  const response = await request.get(image.pathname + image.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test("a Post with a cover image draws it behind the title in its social preview", async ({ page }) => {
  await page.goto("/posts/last-year-smoke-post");
  const og = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
  /** The colour of the image's top-left corner, outside the title card. */
  const corner = (src: string) =>
    page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return [...context.getImageData(4, 4, 1, 1).data.slice(0, 3)];
    }, src);

  const preview = await corner(og.pathname + og.search);
  const cover = await corner("/posts/last-year-smoke-post/cover.jpg");
  preview.forEach((channel, i) => expect(Math.abs(channel - cover[i])).toBeLessThan(16));
});

test("every page links a PNG favicon", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");

  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test("the theme toggle switches the theme and the choice persists across visits", async ({
  browser,
}) => {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.goto("/posts/smoke-post");
  const background = () =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const lightBackground = await background();

  await page.getByRole("banner").getByRole("button", { name: "切換深淺色" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const darkBackground = await background();
  expect(darkBackground).not.toBe(lightBackground);

  await page.goto("/tags");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await background()).toBe(darkBackground);

  await page.getByRole("banner").getByRole("button", { name: "切換深淺色" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await background()).toBe(lightBackground);
  await page.close();
});

test("with no stored choice the theme follows the system preference", async ({ browser }) => {
  const backgrounds: string[] = [];
  for (const colorScheme of ["light", "dark"] as const) {
    const page = await browser.newPage({ colorScheme });
    await page.goto("/posts/smoke-post");
    await expect(page.locator("html"), colorScheme).toHaveAttribute("data-theme", colorScheme);
    backgrounds.push(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
    await page.close();
  }

  expect(backgrounds[0]).not.toBe(backgrounds[1]);
});

test("a stored theme choice applies before the site's JavaScript loads, so it never flashes", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  await context.addInitScript(() => localStorage.setItem("theme", "light"));
  // Hold back every bundle: only what ships inline in the HTML can set the theme.
  await context.route("**/_next/static/**/*.js", (route) => route.abort());
  const page = await context.newPage();

  await page.goto("/posts/smoke-post", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await context.close();
});

test("an unknown URL answers 404 with links back to the content", async ({ request }) => {
  const response = await request.get("/no-such-url");

  expect(response.status()).toBe(404);
  const html = await response.text();
  expect(html).toContain("找不到這個網址");
  expect(html).toContain('href="/posts"');
});
