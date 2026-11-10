# 01: A Slide deck plays in a Post, end to end

**What to build:** A NotebookLM PDF becomes a Slide deck that a Reader can play in a Post. `pnpm deck <slug> <pdf>` reads the PDF and writes the deck next to the Post: compressed slide images, thumbnails, a small download PDF, and a text file with an empty title and text per slide. The original PDF never enters the repo. A Post's body places the deck with `<SlideDeck />`. The player in the reading column shows:

- the current slide, with click zones: the left third goes back, the rest goes forward;
- a progress bar, and ← 3 / 15 → underneath;
- 「下載 PDF（size）」 and 「由 NotebookLM 產生」.

Each slide's image is described by its title and text, is dimmed in the dark theme like a Body image, and the slides either side of the current one are preloaded. The content check refuses a broken deck. See `../spec.md` and the prototype on branch `prototype/slide-deck`, whose `scripts/prototype-deck-convert.ts` already reads a real NotebookLM PDF (Flate with PNG predictors) and rebuilds a JPEG PDF. Rewrite it rather than copying it.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `GLOSSARY.md` has **Slide deck** (shown to readers as 「投影片」) under Content, as the spec words it
- [x] PDF reading is a pure module, bytes in and slide images out, handling Flate with PNG predictors and DCT images; vitest feeds it small fixture PDFs of both kinds and reads back the rebuilt download PDF
- [x] `pnpm deck <slug> <pdf>` writes the slide images (WebP, quality 82), 320px thumbnails, the download PDF (JPEG, quality 82) and `deck.yml` with the slide size and one empty `title`/`text` per slide; it never writes the original PDF into the repo; `sharp` is a dev dependency
- [x] The deck's files are among the Post's images and are served next to it, `.webp` and `.pdf` included; pages read them only through the content module's queries
- [x] Content check rules, each with its own fixture and an error naming file, field and rule:
  - `<SlideDeck />` without a deck, or a deck without `<SlideDeck />`
  - more than one `<SlideDeck />` in a Post
  - slide images not numbered `01` up without gaps, or missing a thumbnail
  - `deck.yml` without exactly one entry per slide with a non-empty `title` and `text`
  - `deck.pdf` missing or over 5 MB
- [x] `<SlideDeck />` is in the MDX component map and draws the player described above; the PDF size is read at build time; only the first slide loads eagerly, and turning preloads the previous slide and the next two
- [x] Smoke uses a three-slide deck in a Post in `e2e/content`, and checks:
  - the player shows 1 / 3;
  - the next button and the right click zone go to slide 2;
  - the PDF link answers 200 with `application/pdf`;
  - each slide's alt is its title and text
- [x] `pnpm shots` of that Post in light and dark at 1280px and 375px, read before ticking; nothing scrolls sideways
