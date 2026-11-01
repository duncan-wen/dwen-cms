# 14: Mermaid diagrams in Posts

**What to build:** A Post can draw flowcharts and architecture diagrams by writing Mermaid in a fenced ```` ```mermaid ```` block. The diagram renders as a crisp vector drawing in the site's colours, follows the light/dark theme, and stays readable on a phone. The Mermaid component comes through the single MDX component map (07).

**Blocked by:** 07, 09

**Status:** done

- [x] A ```` ```mermaid ```` block in a Post renders as an SVG diagram, not as a code block
- [x] Diagram colours come from visual-design/01's tokens and switch with the theme toggle without a reload
- [x] A wide diagram scrolls inside its own box at 375px; the page never scrolls horizontally
- [x] Mermaid that fails to parse fails the content check, naming the Post and the block
- [ ] The typography sample Post has a flowchart and an architecture diagram, and both look right in `pnpm shots`

## Comments

- 2026-11-01: the Owner chose Mermaid over hand-drawn SVG, after reading https://www.aiposthub.com/mattpocock-skills-complete-guide-ai-engineering-workflow/ as an example of the long tutorial Posts they want, with workflow and architecture diagrams.
- Vercel's build has no browser, so a renderer that needs Playwright at build time (e.g. `rehype-mermaid`) won't work there. Pick a renderer that runs in Node, or render in the browser from the token CSS variables. Note the choice under Comments.
- Text in diagrams is Traditional Chinese, so the font has to render it.
- Built. Renderer: `beautiful-mermaid` draws each block to SVG at build time in plain Node (no browser, no client JS). Its colours are CSS variables, set to the colour tokens (`--paper`, `--ink`, `--ink-soft`, `--accent`, `--accent-wash`), so the toggle restyles diagrams through the cascade; its CJK-aware text measuring sizes Chinese labels, and `.mermaid-diagram text` uses the site's sans stack. A remark step turns each block into `<Mermaid>` from the component map. Wide diagrams scroll in their own box on a phone and shrink to the column from `sm` up. The content check parses each block with Mermaid's own parser (`mermaid` + `jsdom`, as DOMPurify needs a DOM; both are `serverExternalPackages`) and fails a parse error (`mermaid-syntax`) or a type the renderer can't draw (`mermaid-diagram-type`: it draws flowchart, state, sequence, class, ER and xychart), naming the block's position and file line. Mermaid's `architecture-beta` isn't drawn, so architecture diagrams are flowcharts with `subgraph`s.
- `beautiful-mermaid` carries a one-line `pnpm patch` (`patches/`): ELK breaks cycles by source order, otherwise a loop back (審閱 → 退回修改 → 撰寫) flips the first node below the rest. A test in `src/mdx/mermaid-svg.test.ts` guards it; drop the patch if upstream adopts it.
- Known limit: `beautiful-mermaid` misreads non-ASCII node IDs (`審閱[審閱]`), which Mermaid accepts, so the check passes but the drawing breaks. Write IDs in ASCII and labels in Chinese (`review{審閱}`); the write-post skill should say so.
- "Look right in `pnpm shots`" stays unticked until the Owner checks the screenshots.
