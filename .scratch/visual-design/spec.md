# Spec: Visual design

**Status:** ready-for-agent

## Problem Statement

The site works but has no visual identity: a bare single column on white with zinc greys, system fonts, no header navigation and no footer. Readers are prospective employers and clients first and fellow engineers second, so the site has to read as professional and trustworthy, and it should also be recognisably the Owner's own instead of looking like a default Tailwind page.

## Solution

Direction **A "editorial"**, picked from a three-way prototype, plus two details borrowed from direction B "engineering notes":

- Headings in Noto Serif TC (the one identity mark); body text in the system sans stack (PingFang TC / Microsoft JhengHei), so reading speed and page weight don't suffer.
- A slightly cool paper-white ground with an ink-green accent in light mode; a dark green-black ground with a pale green accent in dark mode. Both themes are designed now, as tokens.
- From B: dates and Tags set in a monospace face (JetBrains Mono), and a right-hand table of contents on wide screens for Post pages.
- A single centred reading column (~680px). Post titles are centred in the Post header.

Prototype (throwaway, never merged): branch `prototype/visual-design`, file `.scratch/visual-design/prototype/index.html`, also published at https://claude.ai/artifact/WqYDaatMsMWAtLqG1Gk5cB. Flip to direction A with `#a-home`, `#a-list`, `#a-post`.

## User Stories

1. As a Reader, I want a recognisable, calm reading layout, so that the site feels professional and I remember whose it is.
2. As a Reader, I want navigation to Posts, Tags and About on every page, so that I never need the back button to find more.
3. As a Reader, I want a footer with the Owner's GitHub, Email, LinkedIn and RSS, so that I can follow or contact them.
4. As a Reader, I want long Posts to show a table of contents on wide screens, so that I can see the structure and jump around.
5. As a Reader, I want the Post list grouped by year, so that I can find older Posts as the list grows.
6. As a Reader, I want code blocks whose colours match the rest of the site in both themes, so that technical Posts don't look patched together.

## Implementation Decisions

- **Tokens**: every colour is a CSS custom property defined once for light and once for dark in `globals.css` and exposed to Tailwind via `@theme`. No component uses a literal colour. Dark values apply under `prefers-color-scheme: dark` and under an explicit `data-theme="dark"`, so ticket blog-v1/09's toggle only has to set the attribute. Starting values are in the prototype (`:root.v-a` blocks).
- **Fonts**: Noto Serif TC (weights 700 and 900, headings only) and JetBrains Mono (dates, Tags, code) via `next/font/google`. Body text uses the system stack, no web font.
- **Home**: short hero (headline, one-paragraph intro, 「關於我 →」 and 「聯絡我 →」 links), then the five latest Posts, not grouped. 「聯絡我」 links to `/about#contact`; no `mailto:`.
- **`/posts`**: grouped by year, newest first.
- **Post page**: centred header (title, date, Tags), prose body, and on wide screens a sticky table of contents built from `h2` headings. Heading ids come from a maintained rehype plugin (such as `rehype-slug`), per ADR-0003.
- **Header**: Owner's name (links home) on the left; 文章 / 標籤 / 關於 and a slot for the theme toggle on the right. Demos aren't in the nav until phase 2.
- **Footer**: © year, GitHub (`duncan-wen`), Email, LinkedIn, RSS. RSS links to the feed ticket blog-v1/08 builds.

## Testing Decisions

Visual layout, typography and both themes are checked by the Owner on preview URLs, as the v1 spec already says. Smoke tests only cover behaviour that can regress silently: the header nav links resolve, the footer links are present, and a Post with `h2` headings renders a table of contents linking to their ids.

## Out of Scope

- The theme toggle's behaviour and no-flash initial theme (blog-v1/09).
- Syntax highlighting itself (blog-v1/07); this spec only sets its colours.
- Demo pages and their nav entry (phase 2).
- A photo or richer hero; the About page can carry a photo later.

## Further Notes

The two directions not taken: B (sidebar layout, docs-site feel) read more like documentation than a personal brand; C (big type, minimal) had the least identity per pixel for a Chinese-language site.
