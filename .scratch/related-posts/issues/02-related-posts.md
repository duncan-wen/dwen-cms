# 02: Related Posts at the end of every Post

**What to build:** A Reader who finishes a Post finds 「接著讀」 after the Signature: up to 3 other Posts, each a row with its Cover, its title linking to it, its description in at most 2 lines, and 「系列：<title>」 when it's in a shown Series. The Posts are picked by `listRelatedPosts(slug)` on the content module: the Post itself and its own Series' Posts are left out, the rest are ordered by shared Tags, then newest date, then Slug, and the first 3 are taken. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The content module exposes `listRelatedPosts(slug)`, returning up to 3 Published Posts in the spec's order
- [ ] The Post itself, the Posts of its Series (shown or not), Drafts and taken-down Slugs never appear
- [ ] Fewer than 3 sharing a Tag are filled with the newest other Posts; with no candidates the block isn't rendered
- [ ] `RelatedPosts` sits after the Signature and before the 「所有文章／聯絡我」 row, under the heading 「接著讀」
- [ ] Each row shows the Cover through `PostCover` (on phones too), the title, the description clamped to 2 lines, and `SeriesLabel` for a Post in a shown Series; no date, no Tags
- [ ] `GLOSSARY.md` gains **Related Posts**, and `RelatedPosts` joins the "one way to do each thing" list in `CODING_STANDARDS.md`
- [ ] vitest covers `listRelatedPosts` through the content module on a fixture directory: shared-Tag order, the date and Slug tie-breaks (with data that loads in another order), every exclusion, the fill, a one-Post site
- [ ] Smoke covers: a Post shows 「接著讀」 after the Signature with at most 3 links to other Posts and none to itself
- [ ] `pnpm shots` of a Post, read in light and dark at 1280px and 375px; nothing clips or scrolls sideways
- [ ] The Owner says OK to the screenshots
