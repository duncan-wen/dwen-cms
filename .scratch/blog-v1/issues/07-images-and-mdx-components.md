# 07: Images and MDX components

**What to build:** Posts can include images stored next to them, rendered optimised and correctly sized, plus an optional cover image. Posts can use a callout and get syntax-highlighted code blocks. All MDX components come from a single component map, the extension point phase-2 Demos will plug into.

**Blocked by:** 01, visual-design/01

**Status:** done

- [x] Co-located images render optimised with correct dimensions and no layout shift
- [x] An optional cover image is supported in frontmatter
- [x] A referenced image that doesn't exist fails the content check
- [x] Callout and syntax-highlighted code blocks work in the sample Post
- [x] All MDX components are provided through one component map

## Comments

- Code-block colours follow visual-design/01's tokens in both themes; pick a highlighter whose output can be styled through CSS variables instead of a fixed theme.
- Built on `blog-v1-07`. Body images are Markdown images with a path relative to the Post folder (`![alt](./flow.png)`); `cover: cover.jpg` in frontmatter replaces the generated cover everywhere it shows. The content module sizes every referenced image (PNG, JPEG, GIF, WebP, AVIF) and fails on a missing one, one outside the Post folder (`image-exists`), a file that isn't one of those formats (`image-format`) or a body that isn't valid MDX (`mdx-syntax`). Images are served at `/posts/<slug>/<file>` and optimised by next/image with their width and height. Code is highlighted by Shiki's css-variables theme, mapped onto the `--code-*` tokens in `globals.css`; a body uses `<Callout title="…">`. The sample Post and `last-year-smoke-post` (which carries a cover) show them in `pnpm shots`. The look of the image, Callout and code colours still needs the Owner's OK at spec review.
- 2026-11-01: Owner approved the look of images, the Callout and code colours from the screenshots.
