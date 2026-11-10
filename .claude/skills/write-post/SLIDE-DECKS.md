# Slide decks

When the Owner hands you a NotebookLM PDF (「這篇加上這份投影片：<PDF 路徑>」), it becomes the Post's Slide deck (`GLOSSARY.md`), for a new Post or a Published one. The Owner never runs a command: you convert the PDF, write every slide's text, place the deck and show it to them in the PR. A Post has at most one Slide deck.

## Steps

1. **Convert.** The Post's `index.mdx` exists first: for a new Post, after step 3 of [SKILL.md](SKILL.md); for a Published one, on its `revise-<slug>` branch ([CHANGING-A-POST.md](CHANGING-A-POST.md)). Run `pnpm deck <slug> "<PDF 路徑>"`, quoting the path as the Owner gave it (Windows paths are under `/mnt/c/`). It writes `content/posts/<slug>/deck/`: each slide as `NN.webp` with its thumbnail, a small download copy `deck.pdf`, and `deck.yml` with an empty `title` and `text` per slide. The original PDF stays on the Owner's machine; only `deck/` enters the repo. Done when it prints `Wrote N files`.
2. **Read every slide.** Stack the slides three to an image, so 15 slides take five reads instead of fifteen, at a size where small print stays legible:

   ```bash
   node -e '
   const sharp = require("sharp"), fs = require("fs");
   const [deck, out] = process.argv.slice(1);
   fs.mkdirSync(out, { recursive: true });
   const slides = fs.readdirSync(deck).filter((f) => /^\d+\.webp$/.test(f)).sort();
   (async () => {
     for (let i = 0; i < slides.length; i += 3) {
       const group = slides.slice(i, i + 3);
       const { width, height } = await sharp(`${deck}/${group[0]}`).metadata();
       await sharp({ create: { width, height: height * group.length, channels: 3, background: "#fff" } })
         .composite(group.map((f, j) => ({ input: `${deck}/${f}`, top: j * height, left: 0 })))
         .png().toFile(`${out}/slides-${group[0].slice(0, 2)}.png`);
     }
   })();
   ' content/posts/<slug>/deck test-results/deck
   ```

   Read every `test-results/deck/slides-NN.png` (`NN` is its first slide; `test-results/` is gitignored). Done when you have read every slide.
3. **Write each slide's text** in `deck.yml`, in order, one `title` and one `text` per slide (see **Slide text**). Leave `width`, `height` and the `# NN.webp` comments as `pnpm deck` wrote them. Done when every entry is filled and `pnpm content:check` passes.
4. **Place `<SlideDeck />`** on its own line in the body, after the paragraph that introduces what the slides cover, so the Reader knows what they're about to play. Not at the very top: the body opens with prose. For a Published Post, also write that introducing paragraph if the body has none.
5. **Check and shoot**, as steps 6 and 7 of [SKILL.md](SKILL.md). In the page shots, read the deck in both themes and widths: the first slide shows sharp, with ← 1 / N → under it, and nothing is cut off. Done when the shots pass.
6. **List the deck in the PR** under 「請 Owner 確認」 (step 9 of [SKILL.md](SKILL.md)): where it sits (after which paragraph or under which `##` heading), then every slide numbered with its title and text, quoted as written in `deck.yml`, so the Owner checks the text without opening a file.

## Slide text

Each slide's `title` and `text` are its image's description for screen readers and search engines, and what 「本頁文字」 shows under the player. Write them for a Reader who can't see the slide, in Traditional Chinese, Taiwan usage (as **Voice** in [SKILL.md](SKILL.md) sets out), with English names kept as on the slide.

- **`title`**: the slide's own heading, as written. A slide with no heading (a closing quote, a title card) gets a short phrase naming its point.
- **`text`**: what the slide says, in plain sentences: its claims, numbers, steps and comparisons, with every name and number exactly as on the slide. A diagram's meaning becomes a sentence (先請 AI 把問題翻成英文，推演完再翻回中文); a table becomes the comparison it draws, row by row. Say what the slide says, never how it's laid out: the text reads the same whether the slide is a chart, a table or a list. Usually two to four sentences.
- Leave out what carries no meaning: decorative shapes, the NotebookLM watermark, a line the slide repeats (write it once). NotebookLM's own wording otherwise stays; a deck the Owner wants fixed, they regenerate.
