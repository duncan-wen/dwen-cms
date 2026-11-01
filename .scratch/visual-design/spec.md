# Spec: Visual design

**Status:** ready-for-agent

## Problem Statement

The site works but has no visual identity: a bare single column on white with zinc greys, system fonts, no header navigation and no footer. Readers are prospective employers and clients first and fellow engineers second, so the site has to read as professional and trustworthy, and it should also be recognisably the Owner's own instead of looking like a default Tailwind page.

## Solution

An editorial base with two bold elements, picked over three prototype rounds:

- **Base**: headings in Noto Serif TC; body text in the system sans stack (PingFang TC / Microsoft JhengHei), so reading speed and page weight don't suffer. A slightly cool paper-white ground with an ink-green accent; a dark green-black ground with a pale green accent in dark mode. Content sits in one ~680px reading column, left-aligned.
- **Seal mark**: a small ink-green square seal bearing 「溫」 is the site's identity mark, in the header, the footer and the colophon at the end of each Post.
- **Generated covers**: every Post gets a contour-line cover generated from its Slug, the same every time and recoloured per theme. The home page shows Posts as a grid of covers; the Post page opens with its cover. The same generator feeds the Post's OG image.
- **Vertical headline**: on wide screens the home page's headline is set vertically (直排), ending in the seal like a signature; on phones it falls back to horizontal.
- **Engineering details**: dates and Tags set in a monospace face as ISO dates (`2026-11-01`); a sticky table of contents to the right of wide Post pages.

Prototype (throwaway, never merged): branch `prototype/visual-design`, file `.scratch/visual-design/prototype/index.html`, also published at https://claude.ai/artifact/WqYDaatMsMWAtLqG1Gk5cB. The chosen pieces are variant X (`#x-home`, `#x-list`, `#x-post`) and the hero of variant Y (`#y-home`). The commit history holds the earlier rounds.

## User Stories

1. As a Reader, I want a recognisable, calm reading layout, so that the site feels professional and I remember whose it is.
2. As a Reader, I want each Post to have its own cover image, so that the home page and lists are inviting to browse.
3. As a Reader, I want navigation to Posts, Tags and About on every page, so that I never need the back button to find more.
4. As a Reader, I want a footer with the Owner's GitHub, Email, LinkedIn and RSS, so that I can follow or contact them.
5. As a Reader, I want long Posts to show a table of contents on wide screens, so that I can see the structure and jump around.
6. As a Reader, I want the Post list grouped by year, so that I can find older Posts as the list grows.
7. As a Reader, I want code blocks whose colours match the rest of the site in both themes, so that technical Posts don't look patched together.
8. As the Owner, I want covers generated automatically, so that neither I nor a Writing Agent has to find an image for every Post.

## Implementation Decisions

- **Tokens**: every colour is a CSS custom property defined once for light and once for dark in `globals.css` and exposed to Tailwind via `@theme`. No component uses a literal colour. Dark values apply under `prefers-color-scheme: dark` and under an explicit `data-theme="dark"`, so blog-v1/09's toggle only has to set the attribute. Starting values are in the prototype's `:root` blocks.
- **Fonts**: Noto Serif TC (weights 700 and 900, headings and the seal) and JetBrains Mono (dates, Tags, code) via `next/font/google`. Body text uses the system stack, no web font.
- **Generated covers**: a pure function from Slug to SVG path data (seeded noise, about 22 closed contour lines, every fifth one heavier). Rendered as inline SVG stroked with the accent token, so it recolours per theme with no client JavaScript. The Slug is the seed, so a Post's cover never changes unless its Slug does. The OG image (blog-v1/08) renders the same paths.
- **Home**: the vertical headline with the seal (horizontal below ~640px), a short intro, 「關於我」 and 「聯絡我」 links, then the latest Posts as a cover grid: the newest one large, the rest in two columns. 「聯絡我」 links to `/about#contact`; no `mailto:`.
- **`/posts`**: grouped by year, newest first; each row shows `MM-DD`, a small cover thumbnail, title, description and Tags. The thumbnail is hidden on phones.
- **Post page**: cover, then a left-aligned header (title, date, Tags, Revision note), prose body, and a colophon: the seal, 「Duncan Wen」 and 「寫於 2026年11月1日」 (the long Chinese date only here), then links to all Posts and contact. On wide screens a sticky table of contents built from `h2` headings sits to the right. Heading ids come from a maintained rehype plugin (such as `rehype-slug`), per ADR-0003.
- **Links**: text links are underlined text with no trailing 「→」.
- **Header**: seal and Owner's name (links home) on the left; 文章 / 標籤 / 關於 and a slot for the theme toggle on the right. Demos aren't in the nav until phase 2.
- **Footer**: seal, © year, GitHub (`duncan-wen`), Email, LinkedIn, RSS. RSS links to the feed blog-v1/08 builds.

## Testing Decisions

Visual layout, typography and both themes are checked by the Owner on preview URLs, as the v1 spec already says. Automated tests cover only what can regress silently:

- Unit: the cover generator returns identical output for the same Slug and different output for different Slugs.
- Smoke: the header nav links resolve, the footer links are present, and a Post with `h2` headings renders a table of contents linking to their ids.

## Out of Scope

- The theme toggle's behaviour and no-flash initial theme (blog-v1/09).
- Syntax highlighting itself (blog-v1/07); this spec only sets its colours.
- Hand-picked cover images overriding the generated one (blog-v1/07 owns the optional cover image).
- Demo pages and their nav entry (phase 2).
- A favicon from the seal; worth doing alongside blog-v1/08.

## Further Notes

Directions not taken, all kept in the prototype's history: B (sidebar layout) read like a docs site, C (big-type minimal) had the least identity for a Chinese-language site, and W (a full-bleed ink-green home band) looked like a landing page rather than a personal notebook.
