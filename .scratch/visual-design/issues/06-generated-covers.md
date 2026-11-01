# 06: Generated Post covers

**What to build:** A pure function turns a Post's Slug into a contour-line cover: SVG path data from seeded noise, about 22 closed lines with every fifth one heavier. A cover component renders it as inline SVG stroked with the accent token on the deep-paper token, so it recolours with the theme and needs no client JavaScript. See the prototype's variant X and the spec's Implementation Decisions.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The generator returns identical paths for the same Slug and different paths for different Slugs (unit-tested)
- [ ] The cover component renders at any aspect ratio without distortion or clipping gaps
- [ ] Covers recolour in dark mode with no client JavaScript
- [ ] The generator can be called outside React, so blog-v1/08's OG image can reuse it
