# 09: Dark mode and mobile layout

**What to build:** The site follows the Reader's system light/dark preference, with a manual toggle that remembers their choice. Every page works at phone width with no horizontal scrolling.

**Blocked by:** 01, visual-design/01, visual-design/02

**Status:** done

- [x] The initial theme follows the system preference with no flash of the wrong theme
- [x] A toggle switches themes and the choice persists across visits
- [x] Post bodies, code blocks and lists are readable in both themes
- [x] No page scrolls horizontally at 375px width

## Comments

- The toggle goes in the header slot that visual-design/02 reserves, and only sets `data-theme` on `<html>`; the light and dark palettes come from visual-design/01's tokens.
- Built: `next-themes` (per ADR-0003) sets `data-theme` on `<html>` from its inline script before first paint: the stored choice, or with none the system preference. Smoke tests cover the toggle, persistence, the system default and the no-flash script (with every JS bundle blocked). `pnpm shots` on every page path showed no horizontal scrolling at 375px. "Readable in both themes" stays unticked until the Owner checks the screenshots, as the spec says dark mode is checked by the Owner.
- 2026-11-01: Owner approved the screenshots (light/dark × 1280/375). On their feedback, body images are dimmed to 85% brightness in dark mode so light images don't glare.
