# Spec: A sticky site header

**Status:** ready-for-agent

## Problem Statement

The site's header (the Seal, the site's name, 「文章」「標籤」「關於」 and the theme switch) sits at the top of the page and scrolls away with it. A Reader deep in a long Post who wants another Post, a Tag or the About page, or wants to switch to dark, has to scroll all the way back up first.

## Solution

The header stays at the top of the window while the page scrolls, on every page and every screen width. At the top of the page it looks exactly as it does today. Once the page has scrolled, a thin line appears under it, so it reads as sitting above the text that passes beneath it.

The job it does for Readers: help them find Posts, and the rest of the site, from anywhere on a page.

## User Stories

1. As a Reader partway down a Post, I want 「文章」「標籤」「關於」 within reach, so that I can go elsewhere without scrolling back up.
2. As a Reader partway down a Post, I want the theme switch within reach, so that I can switch to dark where I am.
3. As a Reader on a phone, I want the header on one line, so that it takes as little of my short screen as possible.
4. As a Reader, I want text scrolling under the header hidden behind it, so that the two never overlap into something unreadable.
5. As a Reader on a wide screen, I want the contour lines in the margins left whole, so that the header covers only the reading column.
6. As a Reader at the top of a page, I want the header to look as it does today, so that the page's first view is unchanged.
7. As a Reader who follows a link to a heading (the table of contents, 「聯絡我」 to `/about#contact`), I want the heading to land below the header, not under it.
8. As a Reader of a long Post on a wide screen, I want the table of contents to stay in view below the header.
9. As a Reader watching a Slide Deck full screen, I want the header kept out of the way.

## Implementation Decisions

- **Always shown**: the header sticks at the top (`position: sticky; top: 0`) for the whole page; it neither hides on scrolling down nor shrinks. Chosen over a header that hides while scrolling down, or shrinks once scrolled, as the simplest that does the job, with no scroll handler.
- **Every width**: phones too. Its layout is checked at 375px to be one line; if it wraps, the gaps shrink until it doesn't. Below 370px it still wraps onto two lines (fitting it would mean changing how it looks); anchors and the table of contents allow for its height there too.
- **Background as wide as the reading column**: the header's own box (`max-w-2xl`) gets the solid paper colour (`bg-paper`); nothing spans the window, so the Backdrop's lines in the margins stay whole.
- **The line under it**: a line in the rule colour (a shadow, not a border, so it takes no space), shown only once the page has scrolled. An `IntersectionObserver` watches a marker at the top of the page and sets a `data-` attribute on the header when the marker leaves the window; no scroll listener, and no CSS scroll-driven animation (not in every browser the site supports). Without JavaScript, or before it runs, there's no line, which is the at-the-top look.
- **At rest, pixel for pixel as today**: the header gains the bottom padding it needs to sit above passing text; the same amount comes off `main`'s top padding, so the unscrolled page doesn't move.
- **Stacking**: above the page's content, including the `z-10` links in `PostGrid` and `RelatedPosts`, and below the full-screen Slide Deck (`z-50`).
- **The header's height**: `--header-height` in `globals.css` (72px, 114px below 370px where it wraps) is the guess used before JavaScript runs, since a page opened at an anchor scrolls there first; the header then measures itself (`ResizeObserver`) and overwrites it.
- **Anchors**: one `scroll-padding-top` on `html`, `--anchor-offset` (the header's height plus the gap a heading had before), replaces the per-element `scroll-mt-6` on Post headings and on `/about#contact`.
- **Table of contents**: it sticks at `--anchor-offset`, below the header by the same gap as a heading it links to.

## Testing Decisions

- **Smoke (Playwright, `e2e/content`)**: on a long Post, after scrolling down, the header (`banner`) is still in the window at the top; it has no line at the top of the page and has one once scrolled; following a table-of-contents link leaves the heading below the header's bottom edge, not under it.
- **Visual**: `pnpm shots` of the home page, a long Post and `/about`, in light and dark at 1280px and 375px, read by the agent and shown to the Owner: the unscrolled page as today, the header on one line at 375px.
- No unit test: the behaviour is CSS and one observer, and only a browser shows it.

## Out of Scope

- Hiding the header while scrolling down, or shrinking it once scrolled.
- A translucent or blurred background.
- Changing what the header holds or how it looks at rest.
- A 「回到頂端」 button.

## Further Notes

- One ticket. No new term for `GLOSSARY.md` (the header is a part of the page, not a domain concept), and no ADR: the change is small and easy to undo.
