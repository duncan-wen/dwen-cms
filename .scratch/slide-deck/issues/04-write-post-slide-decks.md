# 04: `/write-post` adds Slide decks

**What to build:** The Owner hands `/write-post` a NotebookLM PDF (「這篇加上這份投影片：<PDF 路徑>」), for a new Post or a Published one, and gets a PR with the deck in place. The Writing Agent does the rest:

1. runs `pnpm deck`;
2. reads every slide and fills each one's title and text;
3. places `<SlideDeck />` after the paragraph that introduces what the slides cover, not at the very top;
4. shoots the Post;
5. lists every slide's title and text, and where the deck sits, in the PR under 「請 Owner 確認」.

The Owner never runs a command. See `../spec.md`.

**Blocked by:** 01

**Status:** done

- [x] A `SLIDE-DECKS.md` next to the `write-post` skill gives the steps above, including how to read slides (several stacked into one image to save reads) and what makes good slide text: what the slide says, in plain words, not a description of its layout
- [x] The skill's steps and its **Images** section point at `SLIDE-DECKS.md` when the Owner gives a PDF; its "change a Published Post" path covers adding a deck to an existing Post
- [x] The PR template in the skill lists each slide's title and text and the deck's place in the Post under 「請 Owner 確認」
- [x] `CODING_STANDARDS.md`'s "one way to do each thing" list gains the Slide deck (`SlideDeck`, its files written by `pnpm deck`, which only a Writing Agent runs)
- [x] Dry run: following `SLIDE-DECKS.md` on the first NotebookLM deck in a scratch Post produces a deck that passes the content check; the scratch Post isn't committed
