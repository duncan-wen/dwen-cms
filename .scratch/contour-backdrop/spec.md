# Spec: Contour backdrop

**Status:** done

## Problem Statement

The reading column is 640px wide and centred, so on a desktop screen most of every page is empty paper. The Owner wants that space to make the site livelier and more professional without getting in the way of reading. The site's own contour lines (`src/cover/cover.ts`) are drawn for Post covers and share images, but all 9 Published Posts carry a cover image, so no Post page shows them.

## Solution

A **Backdrop**: the cover's contour lines drawn across the whole window, fixed behind every page. The lines show in the margins on either side of the reading column and are absent behind it. They change as the Reader scrolls and are still whenever the Reader stops, so nothing moves while someone is reading. Each Post has its own terrain, seeded by its Slug; every other page shares one.

Its job, agreed first: show Readers (prospective employers and clients) that the Owner builds things, and second, give the site a look that is recognisably its own. It carries no information and doesn't help anyone find a Post. If it makes a Post harder to read, it has failed.

The Owner agreed these decisions in chat on 2026-11-15 (grilling, three rounds, Q1–Q18), after trying the prototype on the `prototype/contour-backdrop` branch (commit `d0cc65f`), which compared lines moved by time, moved by scroll and still, at three strengths.

## User Stories

1. As a Reader on a desktop screen, I want the margins to show something made for this site, so that the site reads as built by someone who builds things.
2. As a Reader reading a Post, I want nothing to move while I'm not scrolling and no lines behind the text, so that the backdrop never competes with the words.
3. As a Reader who asked for reduced motion, I want the lines to stay still, so that scrolling moves nothing but the page.
4. As a Reader on a phone, I want the lines still and only at the top of the page, so that they cost no battery and never sit behind the text.
5. As a Reader using either theme, I want the lines to follow it, so that they look part of the page.
6. As the Owner, I want one site-wide setting for the lines' strength (faint, medium, accent or off), so that I can turn them down or off without a redesign.

## Decisions

- **Where**: every page the root layout renders (home, `/posts`, a Post, `/tags`, a Tag, a Series, About, not-found). A Demo is its own page under `public/demos/` and gets none.
- **Shape**: the cover's terrain, one centre with 22 closed lines, scaled to cover the window and cropped, not stretched. No second terrain algorithm.
- **Seed**: on `/posts/<slug>` the Post's Slug, so a Post's backdrop matches its generated cover; everywhere else one fixed site seed.
- **Where the lines show**: from 1024px, fixed to the window, full strength in the margins, fading out over the last stretch before the reading column and absent behind it (the prototype left 15% there; the Owner chose none). Below 1024px, only at the top of the page, fading out within about 260px and scrolling away with it. (Agreed as 640px and "near the top of the screen"; code review found the column leaves no margin until about 880px, and that a band fixed to a phone's screen sits behind the text once the Reader scrolls.)
- **A Post's table of contents** sits in the right margin on wide screens, over the lines. It stays; its legibility is checked in the screenshots.
- **Motion**: the terrain's phase follows the scroll position, eased, as in the prototype's variant B. At rest nothing changes and no frame is drawn. The home page follows the same rule, so the backdrop is still beside the Agent animation unless the Reader scrolls. Below 1024px, and for Readers who ask for reduced motion, the lines never move.
- **Changing page**: the terrain is replaced at once, with no morph between two seeds.
- **Strength**: one site-wide constant, `off`, `faint`, `medium` or `accent`, set to `medium`. `faint` is the rule colour; `medium` mixes 40% soft ink into it; `accent` mixes 45% accent into it; `off` draws nothing at all. Readers get no control, and a Post can't set its own. The Owner changes it by asking; the change ships as a PR with screenshots like any visual change.
- **Colour**: the three strengths are defined once in `src/app/globals.css` from the existing tokens, so the lines follow both themes with no script.
- **Behind other layers**: a Lightbox and a fullscreen Slide deck cover the backdrop; nothing is done for them.
- **Glossary**: a new **Backdrop** entry. It is not an Animation (it explains nothing and isn't a figure) and not a Cover. Readers are never shown a name for it.

## Implementation Decisions

- **`src/cover/cover.ts`** gains an optional phase for `generateCover`, so the backdrop and the covers draw from one function. With no phase its output is unchanged, so every existing cover, OG image and promo image stays byte-for-byte the same.
- **The lines are in the page's HTML at rest**, drawn where the page is rendered, so they show before any script runs and a Reader without scripts still gets them, still. A small client component only moves them.
- **SVG, not canvas**: 22 paths whose `d` is rewritten while scrolling, stroked in `currentColor`. Colour and the fade are CSS; the component holds no colour.
- **The backdrop is decoration**: `aria-hidden`, no pointer events, behind everything.
- **The constant** lives beside the site's other fixed values (as `src/site-name.ts` does for the site's name), with a comment saying what each value looks like.
- **Rewritten from this spec**, not promoted from the prototype, which has no tests and a switcher bar.

## Testing Decisions

- Unit (`src/cover/cover.test.ts`): `generateCover(slug)` with no phase equals today's output; a different phase gives different paths; the same slug and phase give the same paths.
- Smoke (built site, `e2e/content`): the backdrop is present and `aria-hidden` on the home page, a Post and the not-found page; two Posts have different lines and two non-Post pages the same; at 1280px scrolling a Post changes the lines; with reduced motion, and at 375px, scrolling changes nothing, and at 375px the lines leave the screen with the top of the page.
- `pnpm shots / /posts/typography-sample /posts` in light and dark at 1280px and 375px, read before ticking: no line behind the reading column, the table of contents legible, nothing scrolling sideways.
- `off` is checked by a unit or component test, not by shipping it.

## Out of Scope

- A control for Readers, or a strength per Post.
- Lines moved by time, by the pointer, or a morph between pages.
- A second terrain (several peaks, noise fields).
- Any change to Covers, OG images or promo images.
- A backdrop on Demo pages.
- A Post about how it was made.
