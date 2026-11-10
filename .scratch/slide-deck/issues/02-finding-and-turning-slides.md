# 02: Finding and turning slides

**What to build:** A Reader can move through a Slide deck the way they move through any gallery, and jump straight to the slide they want:

- **Keys:** ← → (and Space, PageUp/PageDown, Home/End) turn slides while the player has focus or the pointer is over it, and do nothing to the player otherwise.
- **Swipe:** on a phone, swiping left or right turns slides.
- **Links to a slide:** turning a slide updates the address to `#slide-N`, and opening such a link starts the player on that slide and scrolls it into view.
- **「所有頁面」:** a fold that opens a grid of thumbnails (5 per row on desktop, 3 on a phone); choosing one jumps to that slide. Thumbnails load only when the fold opens.
- **「本頁文字」:** a fold that shows the current slide's title and text.

Nothing in the player scrolls sideways. See `../spec.md`. The prototype's variant A on branch `prototype/slide-deck` shows the intended feel, though its thumbnails scroll sideways and must not.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Keys turn slides only while the player has focus or the pointer is over it; typing in a text box is never intercepted
- [ ] Swiping left or right on the slide turns it
- [ ] Turning updates `#slide-N`; opening `#slide-N` starts on slide N with the player in view; an out-of-range or malformed hash starts on slide 1
- [ ] 「所有頁面」 opens a thumbnail grid, 5 per row at desktop width and 3 on a phone; thumbnails are requested only once it opens; choosing one jumps to that slide
- [ ] 「本頁文字」 shows the current slide's title and text and follows the slide as it turns
- [ ] Smoke checks:
  - arrow keys with the player focused, and no effect unfocused;
  - opening `#slide-3`;
  - 「所有頁面」 showing three thumbnails and jumping;
  - 「本頁文字」 showing the current slide's text
- [ ] `pnpm shots` in light and dark at 1280px and 375px, with 「所有頁面」 open in one shot, read before ticking; the shots pass (nothing clipped or scrolling sideways)
