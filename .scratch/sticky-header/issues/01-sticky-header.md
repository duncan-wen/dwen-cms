# 01: Sticky header

**What to build:** The site header stays at the top of the window while any page scrolls, at every width, on a solid paper background as wide as the reading column. At the top of the page it looks as it does today; once scrolled, a thin line appears under it. Links to headings land below it, and the table of contents stays below it. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The header is sticky at the top, with a `bg-paper` background no wider than the reading column, above the page's `z-10` links and below the full-screen Slide Deck
- [x] An `IntersectionObserver` on a marker at the top of the page marks the header as scrolled; only then does the line in the rule colour show under it
- [x] The unscrolled page doesn't move: the padding the header gains comes off `main`
- [x] `scroll-padding-top` on `html` replaces the `scroll-mt-6` on Post headings and on `/about#contact`; the table of contents' sticky `top` clears the header
- [x] Smoke covers: the header still at the top after scrolling a long Post, no line at the top and a line once scrolled, a table-of-contents link landing its heading below the header
- [x] `pnpm shots` of `/`, a long Post and `/about` read in light and dark at 1280px and 375px: unscrolled as today, the header on one line at 375px
- [x] The Owner says OK to the screenshots

## Comments

- 2026-11-17: At 375px the header first wrapped onto two lines (the name 164px, the links and theme switch 188px, in 343px). Below `sm` its gap is now 16px and the links' 12px, which fits it on one line; smoke checks the header's height equals `--header-height` (72px) at 1280px and 375px, so a wrap fails it. At 320px it still wraps.
- 2026-11-17: Review fixes. Below 370px the header still wraps (114px), and a page opened at an anchor there landed its target under it, since the anchor offset assumed 72px. The header now measures its own height into `--header-height`, and `globals.css` guesses 114px below 370px for the moment before it does; smoke checks the guesses against the measured height at 1280px, 375px and 320px, and `/about#contact` at 320px. Anchors and the table of contents share one `--anchor-offset`; the table of contents sits that far down (24px under the header, like a heading), which the spec now says. The one-line smoke check compares the name's and the links' rows instead of the height.
- 2026-11-17: The Owner said OK to the screenshots (unscrolled `/`, a long Post and `/about`; scrolled Post at 1280px, 375px and 320px).
