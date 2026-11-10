# Spec: Slide decks in a Post

**Status:** ready-for-agent

## Problem Statement

The Owner makes slide decks with NotebookLM and wants Readers to be able to play them inside a Post. NotebookLM downloads a deck as PDF or PPTX. Both hold the same thing: one full-page image per slide (1376×768), with no text layer and no editable text. A browser can't play a PPTX at all. An embedded PDF looks different in every browser, is hard to use on a phone, and has no fullscreen mode, no swiping and no links to a single slide. The original files are also large (15.5 MB for 15 slides), too large to keep adding to git, where every version stays forever.

## Solution

A **Slide deck** (「投影片」) is stored next to its Post as compressed slide images, a small download copy of the PDF, and a text file with each slide's title and text. The Post's body places it with `<SlideDeck />`, which draws a player in the reading column:

- the current slide, with click zones (left third goes back, the rest goes forward), a progress bar, and ← 3 / 15 → underneath;
- 「全螢幕」 (or F), 「下載 PDF（1.6 MB）」 and 「由 NotebookLM 產生」;
- a fold, 「所有頁面」, that opens a thumbnail grid to jump to any slide;
- a fold, 「本頁文字」, with the current slide's text.

The Owner never runs a command. They hand the NotebookLM PDF to `/write-post` (「這篇加上這份投影片：<PDF 路徑>」, for a new Post or an existing one). The Writing Agent then:

1. converts the PDF with a one-off command;
2. writes each slide's text by looking at the slide;
3. places `<SlideDeck />` where it fits the Post;
4. lists the slide text in the PR for the Owner to read.

The original PDF stays on the Owner's machine. Measured on the first deck: 15.5 MB became 1.2 MB of slide images and a 1.6 MB download PDF.

The Owner picked this player (variant A) from three prototypes. Prototype and verdict: branch `prototype/slide-deck` (commits `6744ec8`, `e2ae653`).

## User Stories

1. As a Reader, I want to play a Post's slides in place without leaving the Post, so that the slides read as part of the article.
2. As a Reader, I want to see where I am (3 / 15) and how far there is to go, so that I can pace myself.
3. As a Reader, I want to go forward and back with visible buttons and by clicking the slide, so that I needn't know any shortcut.
4. As a Reader on a phone, I want to swipe left and right to turn slides, so that it feels like any other gallery.
5. As a Reader on a keyboard, I want ← → (also Space, PageUp/PageDown, Home/End) to turn slides once the player has focus or the pointer is over it, so that the keys don't hijack the rest of the page.
6. As a Reader, I want fullscreen with a button or F, and Esc to leave it, so that I can read small text on a big screen.
7. As a Reader on an iPhone, where the browser has no element fullscreen, I want the player to cover the page instead, so that fullscreen still works.
8. As a Reader, I want a one-time hint the first time I enter fullscreen (「← → 或左右滑動翻頁 · Esc 離開」), so that I learn the controls without reading instructions.
9. As a Reader, I want to open 「所有頁面」 and jump to any slide from its thumbnail, so that I can skip to the part I care about.
10. As a Reader, I want to read the current slide's text under 「本頁文字」, so that I can copy or quote it, or read it when the image's text is too small.
11. As a Reader, I want to share a link to one slide (`#slide-5`) and have it open on that slide, so that I can point someone at the exact slide.
12. As a Reader, I want the next slides already loaded when I turn, and slides I never reach never downloaded, so that turning is instant and a phone isn't burdened.
13. As a Reader, I want to download the deck as a PDF, with its size shown, so that I can keep it or read it offline.
14. As a Reader in the dark theme, I want the light slides dimmed like other Body images, so that they don't glare.
15. As a Reader using a screen reader, I want each slide's title and text as its description, so that the deck isn't a row of blank images.
16. As a Reader, I want to be told the slides were made with NotebookLM, so that I know how they were made.
17. As the Owner, I want to give `/write-post` a NotebookLM PDF's path and ask for it in a new or existing Post, and get a PR with the deck in place, so that I never run a command or touch the files myself.
18. As the Owner, I want the original PDF kept out of git and only the compressed files committed, so that the repository doesn't grow by 15 MB a deck.
19. As a Writing Agent, I want the command to leave a text file with one empty entry per slide, which I fill in by looking at each slide, so that the text is written once and checked.
20. As the Owner, I want the content check to fail a deck whose text is missing or doesn't match its slides, or whose files are missing or too big, so that a broken deck never ships.
21. As the Owner, I want the PR to list each slide's title and text, and to say where in the Post the deck sits, so that I can check the text without opening files.

## Implementation Decisions

- **Glossary**: add **Slide deck** under Content: a set of slides made outside the site (today with NotebookLM), stored next to a Post and played inside it. Shown to readers as 「投影片」. _Avoid_: presentation, slideshow, carousel, PPT. A Post containing a Slide deck is still a Post, and a Slide deck isn't a Demo, since nothing in it is interactive beyond turning slides.
- **Storage**, in the Post's folder under `deck/`: `01.webp` … `NN.webp` (quality 82), `01-thumb.webp` … (320px wide), `deck.pdf` (the download copy, rebuilt from JPEGs at quality 82), and `deck.yml` (the slide size, and one `title` and `text` per slide, in order). At most one Slide deck per Post, so the link to a slide is simply `#slide-N`.
- **Conversion command**: `pnpm deck <slug> <path-to.pdf>`. It reads the NotebookLM PDF (one image per page, Flate with PNG predictors, or DCT), writes the files above, and writes `deck.yml` with an empty `title` and `text` per slide. It never copies the original PDF into the repo. It is a rewrite of `scripts/prototype-deck-convert.ts` from the prototype branch, with the PDF reading in a pure module that takes bytes and returns slide images. It uses `sharp`, added as a dev dependency.
- **`/write-post` learns Slide decks.** A new `SLIDE-DECKS.md` next to the skill, pointed at from its steps and from **Images**, says:
  - when the Owner gives a PDF path, run `pnpm deck`;
  - read every slide and fill `deck.yml`;
  - place `<SlideDeck />` after the paragraph that introduces what the slides cover, not at the very top;
  - shoot the Post with 「所有頁面」 open;
  - list the slides' text in the PR under 「請 Owner 確認」.

  The skill's "change a Published Post" path covers adding a deck to an existing Post.
- **The text** is written by the Writing Agent by looking at each slide image, then read by the Owner in the PR. It is the image's alt text, the 「本頁文字」 fold, and in the page's HTML for search engines.
- **Content module**: the deck's files are part of the Post's images (`listPostImages`), so they are served next to the Post through `postImageUrl`. The deck and its text are read through the content module's query interface, never from files directly. `.webp` and `.pdf` join the Post files the image route serves.
- **Content check rules**:
  - `<SlideDeck />` in a body needs a `deck/` folder, and a `deck/` folder needs a `<SlideDeck />`.
  - At most one `<SlideDeck />` per Post.
  - Slide images are numbered `01` up with no gaps, each with its thumbnail.
  - `deck.yml` has exactly one entry per slide, with non-empty `title` and `text`.
  - `deck.pdf` exists and is at most 5 MB, which also stops an original being committed by mistake.
- **Player**: `SlideDeck`, joined to `src/mdx/components.tsx`, behaving as the Solution and User Stories describe.
  - Keys apply only while the player has focus or the pointer is over it.
  - Fullscreen uses the browser's element fullscreen where it exists, otherwise a layer covering the page.
  - The first-fullscreen hint is remembered in browser storage; if storage is unavailable, the hint simply shows again.
  - Only the first slide loads eagerly; each turn preloads the previous one and the next two; thumbnails load only when 「所有頁面」 opens.
  - The thumbnail grid is 5 per row on desktop and 3 on a phone. Nothing in the player scrolls sideways.
  - The slide image is dimmed in the dark theme like a Body image (`dark:brightness-[.85]`), but not in fullscreen.
  - The PDF's size is read from the file at build time.
- **New shared piece**: the Slide deck joins the "one way to do each thing" list in `CODING_STANDARDS.md` (`SlideDeck`, its files written by `pnpm deck`, which only a Writing Agent runs).

## Testing Decisions

- Tests check behaviour through a public interface (`CODING_STANDARDS.md`).
- **PDF reading (vitest)**: the pure module, fed a small fixture PDF built the way NotebookLM builds its decks (Flate with PNG predictors) and one with DCT images, returns the right number of slides with the right size and pixels. The rebuilt download PDF is read back by the same module.
- **Content check (vitest)**: one fixture directory per rule above, each breaking only that rule, with errors naming the file, the field and the rule. Prior art: `src/content/fixtures/` and `src/content/content.test.ts`.
- **Smoke (Playwright)**: a Post in `e2e/content` with a three-slide deck. The test checks:
  - the player shows slide 1 of 3;
  - → and the next button go to slide 2 and update the counter and `#slide-2`;
  - opening `#slide-3` starts on slide 3;
  - arrow keys turn slides with the player focused, and do nothing with it unfocused;
  - 「所有頁面」 shows three thumbnails and jumping works;
  - 「本頁文字」 shows the current slide's text;
  - the PDF link answers 200 with `application/pdf`;
  - each slide image's alt is its title and text.

  Prior art: `e2e/smoke.spec.ts`.
- **Visual**: `pnpm shots` of the smoke Post in light and dark at 1280px and 375px, with 「所有頁面」 open in one shot, for the Owner's review. The fullscreen hint and swiping are checked by hand on the preview, on a phone, and named in the PR.

## Out of Scope

- PPTX input, slides that follow the site's theme, and slide animations or transitions.
- OCR. The text is written by the Writing Agent.
- Speaker notes, autoplay, and per-slide analytics.
- More than one Slide deck per Post.
- Fixing NotebookLM's own mistakes in a deck (slide 15 of the first deck repeats a line). The Owner regenerates the deck if they want it fixed.
- The first real Post with a deck. It ships later through `/write-post`.

## Further Notes

- Considered and rejected: embedding the PDF (inconsistent viewers, poor on phones), Office Online for PPTX (an outside service for something images do), Git LFS or Vercel Blob for the originals (unneeded once compressed, and against ADR 0001's content in git).
- ADR skipped: storing compressed images rather than the original is easy to reverse, since the command can be rerun from the original at any time.
- The prototype's lint suppressions (`react-hooks/refs`, `set-state-in-effect`) point at real issues to design out in the rewrite, not to carry over.
