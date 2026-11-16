# 01: Sticky header

**What to build:** The site header stays at the top of the window while any page scrolls, at every width, on a solid paper background as wide as the reading column. At the top of the page it looks as it does today; once scrolled, a thin line appears under it. Links to headings land below it, and the table of contents stays below it. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The header is sticky at the top, with a `bg-paper` background no wider than the reading column, above the page's `z-10` links and below the full-screen Slide Deck
- [ ] An `IntersectionObserver` on a marker at the top of the page marks the header as scrolled; only then does the line in the rule colour show under it
- [ ] The unscrolled page doesn't move: the padding the header gains comes off `main`
- [ ] `scroll-padding-top` on `html` replaces the `scroll-mt-6` on Post headings and on `/about#contact`; the table of contents' sticky `top` clears the header
- [ ] Smoke covers: the header still at the top after scrolling a long Post, no line at the top and a line once scrolled, a table-of-contents link landing its heading below the header
- [ ] `pnpm shots` of `/`, a long Post and `/about` read in light and dark at 1280px and 375px: unscrolled as today, the header on one line at 375px
- [ ] The Owner says OK to the screenshots

## Comments
