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

test("a body image loads optimised, its box sized from the image before it loads", async ({ page }) => {
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

test.describe("a Slide deck", () => {
  const post = "/posts/slide-deck-smoke-post";
  const slides = [
    "煙霧測試投影片。確認投影片在文章裡播放",
    "翻頁。按鈕和點擊投影片都能翻到下一頁",
    "下載。投影片可以下載成 PDF",
  ];
  const player = (page: Page) => page.getByRole("figure", { name: "投影片" });

  test("plays in the Post, starting on slide 1 of 3", async ({ page }) => {
    await page.goto(post);

    await expect(player(page).getByRole("img", { name: slides[0] })).toBeVisible();
    await expect(player(page)).toContainText("1 / 3");
    await expect(player(page)).toContainText("由 NotebookLM 產生");
  });

  test("the next button goes to slide 2", async ({ page }) => {
    await page.goto(post);

    await player(page).getByRole("button", { name: "下一頁" }).click();

    await expect(player(page)).toContainText("2 / 3");
    await expect(player(page).getByRole("img", { name: slides[1] })).toBeVisible();
  });

  test("clicking the slide's right side goes to slide 2, and its left third back", async ({ page }) => {
    await page.goto(post);
    const slide = player(page).getByRole("img");
    const { width, height } = (await slide.boundingBox())!;

    await slide.click({ position: { x: width * 0.8, y: height / 2 }, force: true });
    await expect(player(page)).toContainText("2 / 3");

    await slide.click({ position: { x: width * 0.1, y: height / 2 }, force: true });
    await expect(player(page)).toContainText("1 / 3");
  });

  test("describes each slide by its title and text", async ({ page }) => {
    await page.goto(post);

    for (const [index, alt] of slides.entries()) {
      await expect(player(page).getByRole("img")).toHaveAttribute("alt", alt);
      if (index < slides.length - 1) await player(page).getByRole("button", { name: "下一頁" }).click();
    }
  });

  test("puts every slide's title and text in the page's HTML for search engines, out of sight and hearing", async ({
    page,
    request,
  }) => {
    const response = await request.get(post);
    // Outside scripts, so it's the page's own text, not the data the player starts from.
    const html = (await response.text()).replace(/<script\b[\s\S]*?<\/script>/g, "");

    expect(html).toContain("下載");
    expect(html).toContain("投影片可以下載成 PDF");

    await page.goto(post);
    await player(page).getByText("本頁文字").click();
    await expect(player(page).getByText("確認投影片在文章裡播放")).toBeVisible();
    await expect(player(page).getByText("投影片可以下載成 PDF")).toBeHidden();
  });

  test("offers the download PDF with its size, which answers as a PDF", async ({ page, request }) => {
    await page.goto(post);
    const link = player(page).getByRole("link", { name: /^下載 PDF（\d+ KB）$/ });

    const response = await request.get((await link.getAttribute("href"))!);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");
  });

  test("arrow keys turn slides while the player has focus, and do nothing while it hasn't", async ({ page }) => {
    await page.goto(post);

    await page.keyboard.press("ArrowRight");
    await expect(player(page)).toContainText("1 / 3");

    await player(page)
      .getByRole("group", { name: /^投影片 1 \/ 3/ })
      .focus();
    await page.keyboard.press("ArrowRight");
    await expect(player(page)).toContainText("2 / 3");
    await page.keyboard.press("ArrowLeft");
    await expect(player(page)).toContainText("1 / 3");
    await page.keyboard.press("End");
    await expect(player(page)).toContainText("3 / 3");
  });

  test("arrow keys turn slides while the pointer is over the player", async ({ page }) => {
    await page.goto(post);

    await player(page).getByRole("img").hover({ force: true });
    await page.keyboard.press("ArrowRight");

    await expect(player(page)).toContainText("2 / 3");
  });

  test("swiping left on the slide turns forward, and right turns back", async ({ page }) => {
    await page.goto(post);
    const frame = player(page).getByRole("group", { name: /^投影片 \d \/ 3/ });
    const swipe = (fromX: number, toX: number) =>
      frame.evaluate(
        (element, [from, to]) => {
          const touch = (x: number) => new Touch({ identifier: 1, target: element, clientX: x, clientY: 100 });
          element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [touch(from)] }));
          element.dispatchEvent(new TouchEvent("touchend", { bubbles: true, changedTouches: [touch(to)] }));
        },
        [fromX, toX],
      );

    await swipe(300, 100);
    await expect(player(page)).toContainText("2 / 3");

    await swipe(100, 300);
    await expect(player(page)).toContainText("1 / 3");

    await swipe(200, 180);
    await expect(player(page)).toContainText("1 / 3");
  });

  test.describe("on a touch screen", () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

    test("a finger swiping across the slide's forward side turns one slide, not two", async ({ page }) => {
      await page.goto(post);
      const { x, y, width, height } = (await player(page).getByRole("img").boundingBox())!;
      // A real finger, so the browser decides whether it was also a tap on the click zone under it.
      const cdp = await page.context().newCDPSession(page);
      const finger = (type: "touchStart" | "touchMove" | "touchEnd", at: number) =>
        cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints: type === "touchEnd" ? [] : [{ x: x + width * at, y: y + height / 2 }],
        });

      await finger("touchStart", 0.9);
      for (const at of [0.85, 0.8, 0.7, 0.6, 0.5]) await finger("touchMove", at);
      await finger("touchEnd", 0.5);

      await expect(player(page)).toContainText("2 / 3");
      await page.waitForTimeout(500);
      await expect(player(page)).toContainText("2 / 3");
    });
  });

  test("turning a slide puts it in the address as #slide-N", async ({ page }) => {
    await page.goto(post);

    await player(page).getByRole("button", { name: "下一頁" }).click();

    await expect(page).toHaveURL(/#slide-2$/);
  });

  test("opening #slide-3 starts on slide 3 with the player in view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 300 });
    await page.goto(`${post}#slide-3`);

    await expect(player(page)).toContainText("3 / 3");
    await expect(player(page).getByRole("img", { name: slides[2] })).toBeInViewport();
  });

  for (const hash of ["#slide-9", "#slide-0", "#slide-x", "#slide-2x"]) {
    test(`opening ${hash} starts on slide 1`, async ({ page }) => {
      await page.goto(`${post}${hash}`);

      await expect(player(page).getByRole("img", { name: slides[0] })).toBeVisible();
      await expect(player(page)).toContainText("1 / 3");
    });
  }

  test("「所有頁面」 shows every slide's thumbnail, loaded only once opened, and choosing one jumps to it", async ({
    page,
  }) => {
    const thumbs: string[] = [];
    page.on("request", (request) => {
      if (/\/deck\/\d+-thumb\.webp$/.test(request.url())) thumbs.push(request.url());
    });
    await page.goto(post);
    await page.waitForLoadState("networkidle");
    expect(thumbs).toEqual([]);

    await player(page).getByText("所有頁面").click();
    const grid = player(page).getByRole("list", { name: "所有頁面" });
    await expect(grid.getByRole("listitem")).toHaveCount(3);
    await expect.poll(() => new Set(thumbs).size).toBe(3);

    await grid.getByRole("button", { name: "第 3 頁：下載" }).click();

    await expect(player(page)).toContainText("3 / 3");
    await expect(player(page).getByRole("img", { name: slides[2] })).toBeVisible();
    await expect(page).toHaveURL(/#slide-3$/);
  });

  test("「本頁文字」 shows the current slide's title and text, and follows the slide", async ({ page }) => {
    await page.goto(post);

    await player(page).getByText("本頁文字").click();
    const text = player(page).getByRole("group").filter({ hasText: "本頁文字" });
    // As shown: the other slides' text is in the page too, hidden.
    const shown = { useInnerText: true };
    await expect(text).toContainText("煙霧測試投影片", shown);
    await expect(text).toContainText("確認投影片在文章裡播放", shown);

    await player(page).getByRole("button", { name: "下一頁" }).click();

    await expect(text).toContainText("翻頁", shown);
    await expect(text).toContainText("按鈕和點擊投影片都能翻到下一頁", shown);
    await expect(text).not.toContainText("煙霧測試投影片", shown);
  });

  test("loads only the first slide with the page, and the next two once turned to slide 2", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (request) => {
      const match = request.url().match(/\/deck\/(\d+)\.webp$/);
      if (match) requested.push(match[1]);
    });
    await page.goto(post);
    await page.waitForLoadState("networkidle");
    expect(requested).toEqual(["01"]);

    await player(page).getByRole("button", { name: "下一頁" }).click();

    await expect.poll(() => [...new Set(requested)].sort()).toEqual(["01", "02", "03"]);
  });

  test.describe("fullscreen", () => {
    /** The accessible name of the element the browser shows fullscreen, or null outside it. */
    const fullscreenName = (page: Page) => page.evaluate(() => document.fullscreenElement?.ariaLabel ?? null);
    const close = (page: Page) => player(page).getByRole("button", { name: "關閉" });
    const hint = (page: Page) => player(page).getByText("← → 或左右滑動翻頁 · Esc 離開");

    test("「全螢幕」 shows the slide fullscreen, keys still turn it, and 「關閉」 leaves on the same slide", async ({
      page,
    }) => {
      await page.goto(post);

      await player(page).getByRole("button", { name: "全螢幕" }).click();
      await expect.poll(() => fullscreenName(page)).toMatch(/^投影片 1 \/ 3/);
      await expect(close(page)).toBeVisible();
      await page.keyboard.press("ArrowRight");
      await expect.poll(() => fullscreenName(page)).toMatch(/^投影片 2 \/ 3/);

      await close(page).click();

      await expect.poll(() => fullscreenName(page)).toBeNull();
      await expect(player(page)).toContainText("2 / 3");
      await expect(page).toHaveURL(/#slide-2$/);
      await expect(player(page).getByRole("img", { name: slides[1] })).toBeInViewport();
    });

    test("F enters fullscreen and Esc leaves it on the same slide", async ({ page }) => {
      await page.goto(post);
      await player(page).getByRole("img").hover({ force: true });

      await page.keyboard.press("f");
      await expect.poll(() => fullscreenName(page)).toMatch(/^投影片 1 \/ 3/);
      await expect(close(page)).toBeVisible();
      await page.keyboard.press("End");
      await page.keyboard.press("Escape");

      await expect.poll(() => fullscreenName(page)).toBeNull();
      await expect(close(page)).toBeHidden();
      await expect(player(page)).toContainText("3 / 3");
      await expect(player(page).getByRole("img", { name: slides[2] })).toBeInViewport();
    });

    test("without element fullscreen, the player covers the page and holds it still until left", async ({ page }) => {
      await page.addInitScript(() =>
        Object.defineProperty(Document.prototype, "fullscreenEnabled", { get: () => false }),
      );
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(post);

      await player(page).getByRole("button", { name: "全螢幕" }).click();
      const frame = player(page).getByRole("group", { name: /^投影片 1 \/ 3/ });
      await expect(close(page)).toBeVisible();
      expect(await frame.boundingBox()).toEqual({ x: 0, y: 0, width: 375, height: 667 });
      const scrolled = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrolled);
      await page.keyboard.press("ArrowRight");
      await expect(player(page)).toContainText("2 / 3");

      await page.keyboard.press("Escape");

      await expect(close(page)).toBeHidden();
      await expect(player(page)).toContainText("2 / 3");
      await expect(player(page).getByRole("img", { name: slides[1] })).toBeInViewport();
      await page.mouse.wheel(0, 400);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrolled);
    });

    test("the slide is dimmed in the dark theme's reading column, and undimmed fullscreen", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(post);
      const filter = () =>
        player(page)
          .getByRole("img")
          .evaluate((img) => getComputedStyle(img).filter);
      expect(await filter()).toContain("brightness");

      await player(page).getByRole("button", { name: "全螢幕" }).click();
      await expect(close(page)).toBeVisible();

      expect(await filter()).toBe("none");
    });

    test("the hint shows on the first fullscreen, fades by itself, and not on the next", async ({ page }) => {
      await page.goto(post);
      const enter = async () => {
        await player(page).getByRole("button", { name: "全螢幕" }).click();
        await expect(close(page)).toBeVisible();
      };

      await enter();
      await expect(hint(page)).toBeVisible();
      await expect(hint(page)).toBeHidden({ timeout: 5000 });
      await close(page).click();
      await enter();
      await expect(hint(page)).toHaveCount(0);
      await close(page).click();

      await page.reload();
      await enter();
      await expect(hint(page)).toHaveCount(0);
    });

    test("where storage fails, fullscreen still works and the hint shows each time", async ({ page }) => {
      await page.addInitScript(() =>
        Object.defineProperty(window, "localStorage", {
          get: () => {
            throw new DOMException("blocked", "SecurityError");
          },
        }),
      );
      await page.goto(post);

      for (let entry = 0; entry < 2; entry++) {
        await player(page).getByRole("button", { name: "全螢幕" }).click();
        await expect(close(page)).toBeVisible();
        await expect(hint(page)).toBeVisible();
        await close(page).click();
        await expect(close(page)).toBeHidden();
      }
    });
  });
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

test("a diagram opens in a Lightbox from its button, fitted to the screen, and closes back to it", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/posts/typography-sample");
  const figure = page.locator("article figure:visible", { hasText: "審閱" });
  const opener = figure.getByRole("button", { name: "放大圖表" });
  const inPost = await figure.locator("svg").boundingBox();

  await opener.click();

  const lightbox = page.getByRole("dialog", { name: "放大圖表" });
  const enlarged = await lightbox.locator("svg").boundingBox();
  expect(enlarged!.width).toBeGreaterThan(inPost!.width);
  expect(enlarged!.width).toBeLessThanOrEqual(inPost!.width * 2 + 1);
  expect(enlarged!.y + enlarged!.height).toBeLessThanOrEqual(800);
  await expect(lightbox.locator("text", { hasText: "審閱" }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("a click on a diagram opens it in a Lightbox, and its labels stay readable to screen readers", async ({
  page,
}) => {
  await page.goto("/posts/typography-sample");
  const figure = page.locator("article figure:visible", { hasText: "審閱" });
  await expect(figure.getByRole("button")).toHaveText("放大圖表");

  await figure.locator("svg").click();

  await expect(page.getByRole("dialog", { name: "放大圖表" })).toBeVisible();
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
  expect(border).toBe(
    await page.evaluate((hex) => {
      const probe = document.createElement("div");
      probe.style.color = hex;
      document.body.append(probe);
      return getComputedStyle(probe).color;
    }, rule),
  );
});

test("the Post list answers 200 and links to a Published Post and its Tags", async ({ request }) => {
  const response = await request.get("/posts");

  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('href="/posts/smoke-post"');
  expect(html).toContain('href="/tags/smoke"');
});

test("the home page answers 200, shows the latest Posts and links to the Post list", async ({ request }) => {
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

test("a Post with h2 headings has a table of contents linking to each heading's id", async ({ page }) => {
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

test("a Post ends with a colophon signed by the Owner with the long Chinese date", async ({ request }) => {
  const html = await (await request.get("/posts/typography-sample")).text();

  expect(html).toContain("寫於");
  expect(html).toContain("2026年9月1日");
});

test("the About page answers 200 with its Page content and the AI disclosure", async ({ request }) => {
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

  await expect(main.getByRole("link", { name: "聯絡我", exact: true })).toHaveAttribute("href", "/about#contact");
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

test("a taken-down Slug answers 410 with an explanation and a link to the Post list", async ({ request }) => {
  const response = await request.get("/posts/taken-down-post");

  expect(response.status()).toBe(410);
  const html = await response.text();
  expect(html).toContain("這篇文章已移除");
  expect(html).toContain('href="/posts"');
});

test("the header links home and to 文章, 標籤 and 關於, and each link resolves", async ({ page, request }) => {
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

test("the footer links to GitHub, the Contact form, LinkedIn and RSS, and to no email address", async ({ page }) => {
  await page.goto("/no-such-url");
  const footer = page.getByRole("contentinfo");

  await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
  for (const [name, href] of [
    ["GitHub", "https://github.com/duncan-wen"],
    ["聯絡表單", "/about#contact"],
    ["LinkedIn", "https://www.linkedin.com/in/duncan-wen"],
    ["RSS", "/feed.xml"],
  ]) {
    await expect(footer.getByRole("link", { name })).toHaveAttribute("href", href);
  }
  await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("the About page's #contact section lists the footer's links, less the one to itself", async ({ page }) => {
  await page.goto("/about");
  const hrefs = (scope: Locator) =>
    scope.getByRole("link").evaluateAll((links) => links.map((a) => a.getAttribute("href")));

  const footer = await hrefs(page.getByRole("contentinfo"));
  expect(await hrefs(page.locator("#contact"))).toEqual(footer.filter((href) => href !== "/about#contact"));
});

test("each contact link shows its mark before its label, in the footer and on the About page", async ({ page }) => {
  await page.goto("/about");
  for (const scope of [page.getByRole("contentinfo"), page.locator("#contact")]) {
    for (const name of ["GitHub", "LinkedIn", "RSS"]) {
      await expect(scope.getByRole("link", { name }).locator("svg")).toHaveCount(1);
    }
  }
});

test("the RSS link isn't prefetched as a page", async ({ page }) => {
  const prefetches: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/feed.xml" && request.headers()["rsc"]) prefetches.push(request.url());
  });
  await page.goto("/about#contact");
  await page.locator("#contact").getByRole("link", { name: "RSS" }).hover();
  await page.waitForLoadState("networkidle");
  expect(prefetches).toEqual([]);
});

test("the About page's #contact section holds the Contact form and its privacy note", async ({ page }) => {
  await page.goto("/about");
  const form = page.locator("#contact").getByRole("form", { name: "聯絡表單" });

  for (const label of ["名字", "Email", "訊息"]) await expect(form.getByLabel(label, { exact: true })).toBeVisible();
  await expect(form).toContainText("只用來回覆你");
});

test("sending a filled Contact form replaces it with the confirmation", async ({ page }) => {
  await page.goto("/about");
  const form = page.getByRole("form", { name: "聯絡表單" });

  await form.getByLabel("名字", { exact: true }).fill("煙霧測試");
  await form.getByLabel("Email", { exact: true }).fill("smoke@example.com");
  await form.getByLabel("訊息", { exact: true }).fill("這是一則煙霧測試訊息。");
  await form.getByRole("button", { name: "送出" }).click();

  await expect(page.getByRole("status")).toHaveText("收到了，我會盡快回覆。");
  await expect(form).toHaveCount(0);
});

test("the Contact form won't send with a required field empty", async ({ page }) => {
  await page.goto("/about");
  const form = page.getByRole("form", { name: "聯絡表單" });

  await form.getByLabel("名字", { exact: true }).fill("煙霧測試");
  await form.getByLabel("Email", { exact: true }).fill("smoke@example.com");
  await form.getByRole("button", { name: "送出" }).click();

  const message = form.getByLabel("訊息", { exact: true });
  expect(await message.evaluate((field: HTMLTextAreaElement) => field.validity.valueMissing)).toBe(true);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("a Post ends with the Feedback block and a Page doesn't", async ({ page }) => {
  await page.goto("/posts/smoke-post");
  const feedback = page.getByRole("region", { name: "回饋" });
  await expect(feedback).toContainText("這篇對你有幫助嗎？");
  await expect(feedback.getByRole("button", { name: "有幫助" })).toBeVisible();
  await expect(feedback.getByRole("button", { name: "沒幫助" })).toBeVisible();

  await page.goto("/about");
  await expect(page.getByRole("region", { name: "回饋" })).toHaveCount(0);
});

test("a vote offers an optional line, and the Post thanks the Reader on return", async ({ page }) => {
  await page.goto("/posts/smoke-post");
  const feedback = page.getByRole("region", { name: "回饋" });

  await feedback.getByRole("button", { name: "有幫助" }).click();
  const line = feedback.getByLabel("謝謝！想多說一句嗎？（選填）");
  await expect(line).toBeVisible();
  await line.fill("煙霧測試的一句話");
  await feedback.getByRole("button", { name: "送出" }).click();
  await expect(feedback).toHaveText("謝謝你的回饋。");

  await page.reload();
  await expect(page.getByRole("region", { name: "回饋" })).toHaveText("謝謝你的回饋。");
});

test("a vote is sent to the Feedback endpoint as JSON", async ({ page }) => {
  await page.goto("/posts/smoke-post");
  const sent = page.waitForRequest((request) => request.method() === "POST" && request.url().endsWith("/api/feedback"));
  await page.getByRole("region", { name: "回饋" }).getByRole("button", { name: "有幫助" }).click();
  const request = await sent;
  expect(request.postDataJSON()).toEqual({ slug: "smoke-post", vote: "up" });
  expect((await request.response())?.status()).toBe(200);
});

test("Feedback that isn't about a Published Post is refused", async ({ request }) => {
  const response = await request.post("/api/feedback", { data: { slug: "no-such-post", vote: "up" } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ ok: false });
});

/** The `<loc>`/`<link>` URLs of an XML document, as paths, in document order. */
const paths = (xml: string, tag: string) =>
  [...xml.matchAll(new RegExp(`<${tag}>([^<]*)</${tag}>`, "g"))].map((m) => new URL(m[1]).pathname);

test("the RSS feed answers as RSS and lists Published Posts newest first, and no Pages", async ({ request }) => {
  const response = await request.get("/feed.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].map((m) => paths(m[0], "link")[0]);
  expect(items).toEqual([
    "/posts/smoke-post",
    "/posts/revised-smoke-post",
    "/posts/typography-sample",
    "/posts/slide-deck-smoke-post",
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

test("robots.txt allows every crawler and names the sitemap on the base URL", async ({ request }) => {
  const response = await request.get("/robots.txt");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const lines = (await response.text()).split("\n").map((line) => line.trim());
  expect(lines.filter((line) => line.startsWith("User-Agent:"))).toEqual(["User-Agent: *"]);
  expect(lines).toContain("Allow: /");
  expect(lines.some((line) => line.startsWith("Disallow:"))).toBe(false);
  // `pnpm smoke` builds with SITE_URL=https://dwen.example.
  expect(lines).toContain("Sitemap: https://dwen.example/sitemap.xml");
});

/** Every JSON-LD object a page carries, parsed. */
async function structuredData(page: Page, path: string): Promise<Record<string, unknown>[]> {
  await page.goto(path);
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return scripts.map((text) => JSON.parse(text) as Record<string, unknown>);
}

test("a Post page describes itself as a BlogPosting by the Owner, with date-only dates", async ({ page }) => {
  // `pnpm smoke` builds with SITE_URL=https://dwen.example.
  expect(await structuredData(page, "/posts/smoke-post")).toEqual([
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "煙霧測試文章",
      description: "煙霧測試用的文章，不會出現在正式網站。",
      datePublished: "2026-11-01",
      dateModified: "2026-11-01",
      author: { "@type": "Person", name: "Duncan Wen", url: "https://dwen.example/about" },
      image: "https://dwen.example/posts/smoke-post/opengraph-image",
      inLanguage: "zh-Hant",
      keywords: ["smoke"],
      url: "https://dwen.example/posts/smoke-post",
      mainEntityOfPage: "https://dwen.example/posts/smoke-post",
    },
  ]);
});

test("a Post's structured-data image answers as a PNG", async ({ page, request }) => {
  const [posting] = await structuredData(page, "/posts/smoke-post");
  const response = await request.get(new URL(posting.image as string).pathname);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test("a revised Post's structured data is modified on its latest Revision's date", async ({ page }) => {
  const [posting] = await structuredData(page, "/posts/revised-smoke-post");

  expect(posting).toMatchObject({ datePublished: "2026-10-01", dateModified: "2026-10-15" });
});

test("a taken-down Slug carries no structured data", async ({ page }) => {
  expect(await structuredData(page, "/posts/taken-down-post")).toEqual([]);
});

test("the About Page describes the Owner as a Person with their GitHub and LinkedIn", async ({ page }) => {
  expect(await structuredData(page, "/about")).toEqual([
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: "https://dwen.example/about",
      inLanguage: "zh-Hant",
      mainEntity: {
        "@type": "Person",
        name: "Duncan Wen",
        url: "https://dwen.example/about",
        sameAs: ["https://github.com/duncan-wen", "https://www.linkedin.com/in/duncan-wen"],
      },
    },
  ]);
});

test("the home page names the site as a WebSite", async ({ page }) => {
  expect(await structuredData(page, "/")).toEqual([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Duncan Wen",
      url: "https://dwen.example/",
      inLanguage: "zh-Hant",
    },
  ]);
});

test("the signature at the end of a Post links the Owner's name to the About Page", async ({ page }) => {
  await page.goto("/posts/smoke-post");

  await expect(page.locator("article footer").getByRole("link", { name: "Duncan Wen" })).toHaveAttribute(
    "href",
    "/about",
  );
});

test("every page sets a canonical URL on the configured base URL", async ({ page }) => {
  for (const path of ["/", "/posts", "/posts/smoke-post", "/tags", "/tags/smoke", "/about"]) {
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
  const og = (property: string) => page.locator(`meta[property="${property}"]`).getAttribute("content");

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

test("the theme toggle switches the theme and the choice persists across visits", async ({ browser }) => {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.goto("/posts/smoke-post");
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
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

test("a stored theme choice applies before the site's JavaScript loads, so it never flashes", async ({ browser }) => {
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
