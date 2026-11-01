# 03: Home, Post list and Tag pages

**What to build:** The home page opens with the vertical headline ending in the seal (horizontal below ~640px), a short intro, and 「關於我」 and 「聯絡我」 (to `/about#contact`) links, then the latest Posts as a cover grid: the newest one large, the rest in two columns. `/posts` groups Posts by year, newest first, each row with `MM-DD`, a small cover thumbnail, title, description and Tags. Tag pages and the Tag index use the same list styling. See the prototype's `#y-home` (hero) and `#x-home`, `#x-list`.

**Blocked by:** 02, 06

**Status:** done

- [x] Wide screens show the headline set vertically with the seal at its end; phones show it horizontally
- [x] 「聯絡我」 links to `/about#contact`; text links carry no trailing 「→」
- [x] The home page shows the latest Posts as a cover grid, newest one large
- [x] `/posts` groups Posts under year headings with `MM-DD` dates and cover thumbnails (hidden on phones)
- [x] Tag pages and `/tags` share the new list styling
- [ ] No page scrolls horizontally at 375px; checked by the Owner in both themes on the preview
