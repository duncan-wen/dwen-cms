# 02: Post structured data and signature link

**What to build:** Each Published Post page carries `BlogPosting` JSON-LD built from the Post's own fields, and the Owner's name in the signature at the end of the Post links to the About Page. A small module builds the structured data from domain values and renders it as an escaped `application/ld+json` script; 03 reuses it. See `../spec.md` for the field list.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A Post page has exactly one JSON-LD `BlogPosting` with headline, description, date-only `datePublished`, `dateModified` (latest Revision's date, else the Post's date), author `Person` "Duncan Wen" with the About Page URL, the Open Graph image, `inLanguage` `zh-Hant`, Tags as keywords, and the canonical URL
- [x] `<` in any value is escaped inside the script
- [x] A taken-down Slug carries no `BlogPosting`
- [x] The signature's "Duncan Wen" links to the About Page; nothing else in the Post's layout changes
- [x] Smoke covers the JSON-LD (including a Post with Revisions) and the signature link
- [x] `pnpm shots` on a Post page in light and dark at 1280px and 375px, read before ticking; the Owner says OK to the screenshots

## Comments

- 2026-11-12: The Owner said OK to the `/posts/smoke-post` screenshots (light and dark, 1280px and 375px).
