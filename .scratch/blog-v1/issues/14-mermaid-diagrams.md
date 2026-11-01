# 14: Mermaid diagrams in Posts

**What to build:** A Post can draw flowcharts and architecture diagrams by writing Mermaid in a fenced ```` ```mermaid ```` block. The diagram renders as a crisp vector drawing in the site's colours, follows the light/dark theme, and stays readable on a phone. The Mermaid component comes through the single MDX component map (07).

**Blocked by:** 07, 09

**Status:** ready-for-agent

- [ ] A ```` ```mermaid ```` block in a Post renders as an SVG diagram, not as a code block
- [ ] Diagram colours come from visual-design/01's tokens and switch with the theme toggle without a reload
- [ ] A wide diagram scrolls inside its own box at 375px; the page never scrolls horizontally
- [ ] Mermaid that fails to parse fails the content check, naming the Post and the block
- [ ] The typography sample Post has a flowchart and an architecture diagram, and both look right in `pnpm shots`

## Comments

- 2026-11-01: the Owner chose Mermaid over hand-drawn SVG, after reading https://www.aiposthub.com/mattpocock-skills-complete-guide-ai-engineering-workflow/ as an example of the long tutorial Posts they want, with workflow and architecture diagrams.
- Vercel's build has no browser, so a renderer that needs Playwright at build time (e.g. `rehype-mermaid`) won't work there. Pick a renderer that runs in Node, or render in the browser from the token CSS variables. Note the choice under Comments.
- Text in diagrams is Traditional Chinese, so the font has to render it.
