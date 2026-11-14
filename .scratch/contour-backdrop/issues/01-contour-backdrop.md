# 01: Contour lines behind every page

**What to build:** the Backdrop as `../spec.md` describes: the cover's contour lines across the whole window behind every page, in the margins only, moved by scrolling and still at rest, with one site-wide strength set to `medium`. The prototype on `prototype/contour-backdrop` (commit `d0cc65f`, variant B, ink 2) is the primary source for how it moves and looks; rewrite it, don't promote it.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] `generateCover` takes an optional phase; with none its output is unchanged (unit tests: unchanged without a phase, different with one, the same for the same slug and phase)
- [x] The Backdrop is in the HTML of every page the root layout renders, `aria-hidden`, taking no pointer events, behind everything; a Demo page has none
- [x] A Post's lines are seeded by its Slug; every other page shares the site seed
- [x] From 640px the lines show in the margins and none shows behind the reading column; below 640px they show only near the top of the screen
- [x] At 1280px the lines follow the scroll position, eased, and nothing is drawn at rest; below 640px, and under reduced motion, they never move
- [x] One site-wide strength constant, `off`, `faint`, `medium` or `accent`, set to `medium`; its three colours are defined in `globals.css` from the tokens; `off` draws nothing (tested)
- [x] `GLOSSARY.md` has a **Backdrop** entry
- [x] Smoke: present on the home page, a Post and not-found; two Posts differ and two non-Post pages match; scrolling a Post at 1280px changes the lines; under reduced motion and at 375px it doesn't
- [x] `pnpm shots / /posts/typography-sample /posts` in light and dark at 1280px and 375px, read before ticking: no line behind the reading column, the table of contents legible, nothing scrolls sideways
- [ ] The Owner has seen the screenshots and said OK
