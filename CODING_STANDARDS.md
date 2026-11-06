# Coding standards

Judgement calls for the reviewer. Lint, typecheck and the content check enforce the mechanical rules.

## Domain language

- Reader-facing text uses the names `GLOSSARY.md` gives under "Shown to readers as" (「文章」 for Post, 「標籤」 for Tag). A term with no Reader-facing name is a glossary gap: resolve it there before shipping the text.
- Code, tests and docs use the glossary's English terms, never its _Avoid_ words.

## Content rules

- A content-check error names the file, the field and the rule, and its advice matches the spec's wording for that rule.
- An error about one entry of a list names that entry: its value, or its position when it has no single value (`Revision 2`).
- Every page, feed and image reads content through the content module's query interface, never from content files directly.

## Tests

- Tests check behaviour through a public interface: the content module's queries and errors, HTTP responses from the built site, or a pure module's exports (the cover generator, `src/format-date.ts`).
- Each content rule has its own fixture directory under `src/content/fixtures/` that breaks only that rule, unless the test is about how rules combine.

## Components

- A component's props are a named `type Props`.
- A new visual element (an image treatment, a diagram, an embed) is checked in the dark theme as well as the light one: light artwork on a dark page is dimmed or recoloured to the dark tokens, so it doesn't glare.
- An MDX body gets every component, and every override of a Markdown element, from the one map in `src/mdx/components.tsx`; Demos join it too. Images a Post shows are stored next to it and served through `postImageUrl`.
- One way to do each thing. Reuse the shared piece instead of restyling or reformatting inline: dates through `src/format-date.ts`, page titles through `PageHeading`, standalone text links through `TextLink`, rows of links through `LinkRow`, the seal through `Seal` (in build-time images, `ImageSeal` and `sealFont`), covers through `PostCover` (cover images drawn through `src/cover/cover-image.ts`), HTML escaping in contact sheets through `escapeHtml`, diagrams through a ```` ```mermaid ```` block (`Mermaid`, drawn by `mermaidSvg`), Illustrations through a body image of an `.svg` file (inlined by `BodyImage` through `illustrationSvg`, checked by `checkIllustration`), a page's canonical URL through `pageAlternates`, absolute URLs through `absoluteUrl`, the site's name through `SITE_NAME`, the reading column's image `sizes` through `bodyColumnSizes`, a Post's images through `postImageUrl` and `bodyImageSources`, the serif face and colours in build-time images through `serifFont` and `lightColours` (`darkColours` for an image drawn dark), a Post's promo images through `src/promo/promo-images.tsx`, a Post's title in its OG image through `OgTitle` (its lines sized by `titleFontSize`, an estimate, since the OG renderer can't measure text as `fitPromoText` does in the promo images' browser), the glyphs a title draws through `titleGlyphs`. A new shared piece joins this list.
