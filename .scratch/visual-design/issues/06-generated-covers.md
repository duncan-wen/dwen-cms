# 06: Generated Post covers

**What to build:** A pure function turns a Post's Slug into a contour-line cover: SVG path data from seeded noise, about 22 closed lines with every fifth one heavier. A route writes it at build time as a static SVG file per Published Post (`/covers/<slug>.svg`), and a cover component paints the accent token on the deep-paper token through that file as a CSS `mask-image`, so it recolours with the theme, needs no client JavaScript, and each page carries only a URL. See the prototype's variant X and the spec's Implementation Decisions.

**Blocked by:** 01

**Status:** done

- [x] The generator returns identical paths for the same Slug and different paths for different Slugs (unit-tested)
- [x] The cover component renders at any aspect ratio without distortion or clipping gaps
- [x] Covers recolour in dark mode with no client JavaScript
- [x] The generator can be called outside React, so blog-v1/08's OG image can reuse it
