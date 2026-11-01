# 04: Post page

**What to build:** A Post page opens with its generated cover, then a left-aligned header (serif title, monospace ISO date and Tags, Revision note when present) and the restyled prose body. It ends with a colophon: the seal, 「Duncan Wen」 and 「寫於」 plus the long Chinese date, then links to all Posts and contact. On wide screens a sticky table of contents built from the Post's `h2` headings sits to the right; on narrow screens it's hidden. Heading ids come from a maintained rehype plugin (ADR-0003). See the prototype's `#x-post`.

**Blocked by:** 02, 06

**Status:** ready-for-agent

- [ ] The Post opens with its generated cover and a left-aligned header, including the Revision note
- [ ] The colophon shows the seal, the Owner's name and the long Chinese date
- [ ] `h2` headings get stable ids from a rehype plugin
- [ ] Wide screens show a table of contents linking to each `h2`; a Post with no `h2` shows none
- [ ] At 375px the table of contents is hidden and nothing scrolls horizontally
- [ ] A smoke test confirms a Post with `h2` headings renders a table of contents linking to their ids
