# 03: Fullscreen

**What to build:** A Reader can play a Slide deck fullscreen. 「全螢幕」 or F enters it, and Esc or 「關閉」 leaves it.

- **Where the browser has element fullscreen:** the slide fills the screen on black, undimmed.
- **On an iPhone, where it doesn't:** the player covers the page instead and stops the page from scrolling underneath.
- **The first time a Reader enters fullscreen:** a one-line hint appears, 「← → 或左右滑動翻頁 · Esc 離開」, and fades after about two seconds. The browser remembers that it was shown; where storage is unavailable, the hint just shows again.

Keys, swiping, click zones and `#slide-N` all keep working in fullscreen. See `../spec.md`.

**Blocked by:** 02 (same component; no functional dependency)

**Status:** done

- [x] 「全螢幕」 and F enter fullscreen; Esc and 「關閉」 leave it, returning to the same slide in the reading column
- [x] Without element fullscreen, the player covers the page, and the page doesn't scroll underneath
- [x] The slide is undimmed in fullscreen in both themes
- [x] The hint shows on the first fullscreen only, fades by itself, and storage failures don't break anything
- [x] Smoke checks:
  - F and the button enter fullscreen (or the covering layer);
  - Esc leaves it on the same slide;
  - the hint shows once and not on the second entry
- [ ] Checked by hand on the PR's preview on a phone: swiping, the covering layer on iPhone, and the hint; named in the PR
