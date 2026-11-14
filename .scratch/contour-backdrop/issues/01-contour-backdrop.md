# 01: Contour lines behind every page

**What to build:** the Backdrop as `../spec.md` describes: the cover's contour lines across the whole window behind every page, in the margins only, moved by scrolling and still at rest, with one site-wide strength set to `medium`. The prototype on `prototype/contour-backdrop` (commit `d0cc65f`, variant B, ink 2) is the primary source for how it moves and looks; rewrite it, don't promote it.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `generateCover` takes an optional phase; with none its output is unchanged (unit tests: unchanged without a phase, different with one, the same for the same slug and phase)
- [x] The Backdrop is in the HTML of every page the root layout renders, `aria-hidden`, taking no pointer events, behind everything; a Demo page has none
- [x] A Post's lines are seeded by its Slug; every other page shares the site seed
- [x] From 1024px the lines show in the margins and none shows behind the reading column; below 1024px they show only at the top of the page and scroll away with it
- [x] At 1280px the lines follow the scroll position, eased, and nothing is drawn at rest; below 1024px, and under reduced motion, they never move
- [x] One site-wide strength constant, `off`, `faint`, `medium` or `accent`, set to `medium`; its three colours are defined in `globals.css` from the tokens; `off` draws nothing (tested)
- [x] `GLOSSARY.md` has a **Backdrop** entry
- [x] Smoke: present on the home page, a Post and not-found; two Posts differ and two non-Post pages match; scrolling a Post at 1280px changes the lines; under reduced motion and at 375px it doesn't
- [x] `pnpm shots / /posts/typography-sample /posts` in light and dark at 1280px and 375px, read before ticking: no line behind the reading column, the table of contents legible, nothing scrolls sideways
- [x] The Owner has seen the screenshots and said OK

## Comments

- 2026-11-15: code review moved the wide-screen rule from 640px to 1024px (the column leaves no margin until about 880px) and made the phone's lines scroll away with the top of the page instead of staying fixed to the screen, where they sat behind the text. The spec says so.
- 2026-11-15: the Owner saw the screenshots and said OK, including both changes above.
