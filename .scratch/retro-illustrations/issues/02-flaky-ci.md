# 02: Two flaky CI failures

**What to build:** Two failures that passed on rerun during the Illustrations build (2026-11-07). Use `/diagnosing-bugs`: get a loop that goes red first, then fix.

1. `e2e/smoke.spec.ts`, "a body image's Lightbox": "fits a small viewport…" and "never enlarges an image past its own size" read the dialog image's `boundingBox()` right after the click and got width 0 (PR #46's first CI run). The image likely hadn't loaded yet; wait for it to be complete with a natural size before measuring.
2. main's build failed prerendering `/posts/last-year-smoke-post/opengraph-image` with `TypeError: fetch failed`: `src/og/serif-font.ts` fetches the serif face from Google Fonts at build time. Make the build stop depending on that network call (commit the font file, or retry), keeping the glyph subsetting the OG images rely on.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The Lightbox tests wait for the image before measuring, and pass 20 runs in a row (`pnpm exec playwright test -g Lightbox --repeat-each 20` after `pnpm smoke`'s build)
- [x] The OG images build with the network to fonts.googleapis.com blocked
- [x] `pnpm check`, `pnpm smoke` and `pnpm build:check` pass

## Comments

- 2026-11-07 (agent): Lightbox: delaying `flow.png` by 500ms made the three measuring tests fail every run with width 0; the Lightbox loads the original file only on opening, and an `<img>` sized `w-auto h-auto` is 0px wide until it loads. They now wait for `complete` and a natural width first. The 20× loop also caught a third flake, at about 5%: "stays closed on a modified click" read the new tab's URL while it was still `about:blank`; it now waits for the tab to reach the file. Fonts: a fresh build with every fetch to Google Fonts failing reproduced `TypeError: fetch failed` on `opengraph-image`. Both weights of Noto Serif TC are now committed under `src/og/fonts/` (9.5MB each, with the OFL) and subset with `subset-font` (harfbuzz), kept out of the bundle so its WebAssembly loads. `next/font/google` in the layout still fetches at build, through its own retries.
