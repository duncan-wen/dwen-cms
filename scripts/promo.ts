// Turns Posts into promo images (文宣圖) for social media, in the template their `promo`
// frontmatter picks, at every size in PROMO_SIZES.
//   pnpm promo my-post other-post               Posts from content/
//   CONTENT_DIR=e2e/content pnpm promo smoke-post
// Writes promo/<slug>-<size>.png, plus promo/index.html showing this run's images on one
// page for the Owner. promo/ is gitignored: attach the PNGs to the Draft PR instead.
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { ContentValidationError, type Post } from "../src/content/content";
import { getContent } from "../src/content/site-content";
import { escapeHtml } from "../src/escape-html";
import { fitPromoText, PROMO_SIZES, promoDocument, promoImageId } from "../src/promo/promo-images";
import { SITE_LANGUAGE } from "../src/site-name";

const outDir = "promo";

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("Usage: pnpm promo <slug>…");
  process.exit(1);
}

const content = await getContent().catch((error: unknown) => {
  if (!(error instanceof ContentValidationError)) throw error;
  console.error(error.message);
  process.exit(1);
});
const posts = slugs.map((slug): Post => {
  const result = content.resolveSlug(slug);
  if (result.kind === "post") return result.post;
  console.error(
    result.kind === "redirect"
      ? `"${slug}" is an old Slug; its Post is now "${result.to}"`
      : `No Published Post has the Slug "${slug}"`,
  );
  process.exit(1);
});

const promoPosts = await Promise.all(
  posts.map(async (post) => ({
    ...post,
    coverImage: post.cover && (await content.readPostImage(post.slug, post.cover.file)),
  })),
);

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(await promoDocument(promoPosts), { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(fitPromoText);
const sections: string[] = [];
for (const post of posts) {
  const figures: string[] = [];
  for (const size of PROMO_SIZES) {
    const name = `${promoImageId(post.slug, size)}.png`;
    await page.locator(`#${promoImageId(post.slug, size)}`).screenshot({ path: `${outDir}/${name}` });
    console.log(`${outDir}/${name}`);
    figures.push(
      `<figure><figcaption>${size.label}</figcaption><a href="${escapeHtml(name)}"><img src="${escapeHtml(name)}" alt="${escapeHtml(`${post.slug} ${size.label}`)}"></a></figure>`,
    );
  }
  sections.push(
    `<section><h2>${escapeHtml(post.title)}（${escapeHtml(post.slug)}，${escapeHtml(post.promo.template)}）</h2><div class="row">${figures.join("")}</div></section>`,
  );
}
await browser.close();
writeFileSync(`${outDir}/index.html`, contactSheet(sections));
console.log(`Contact sheet: ${outDir}/index.html`);

function contactSheet(sections: string[]): string {
  return `<!doctype html><html lang="${SITE_LANGUAGE}"><meta charset="utf-8"><title>文宣圖</title>
<style>
  body { margin: 24px; font: 15px/1.6 system-ui, sans-serif; background: #eee; color: #222; }
  h2 { font-size: 18px; margin: 32px 0 8px; }
  .row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
  figure { margin: 0; }
  figcaption { font-size: 13px; color: #555; margin-bottom: 4px; }
  img { display: block; height: 360px; border: 1px solid #ccc; }
</style>
<h1>文宣圖（${new Date().toLocaleString("zh-TW")}）</h1>
<p>點圖片看原尺寸。</p>
${sections.join("\n")}
</html>
`;
}
