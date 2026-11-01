# 04: Post page

**What to build:** A Post page has a centred header (serif title, monospace date and Tags, Revision note when present) and the restyled prose body. On wide screens a sticky table of contents built from the Post's `h2` headings sits to the right; on narrow screens it's hidden. Heading ids come from a maintained rehype plugin (ADR-0003).

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] The Post header matches the prototype's direction A, including the Revision note
- [ ] `h2` headings get stable ids from a rehype plugin
- [ ] Wide screens show a table of contents linking to each `h2`; a Post with no `h2` shows none
- [ ] At 375px the table of contents is hidden and nothing scrolls horizontally
- [ ] A smoke test confirms a Post with `h2` headings renders a table of contents linking to their ids
