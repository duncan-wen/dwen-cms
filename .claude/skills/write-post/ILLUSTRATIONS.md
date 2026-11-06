# Drawing Illustrations

An Illustration (`GLOSSARY.md`) is an SVG file you write by hand, next to the Post, to show one concept a Reader has to *see*: things interleaving over time (threads, requests, retries), a layout in memory or on disk, a before and after. It is static; anything that moves or takes input is a Demo. A process or architecture is a Mermaid Diagram, not an Illustration. Every Illustration explains something the prose around it names; none is decoration.

Start from [illustration-example.svg](illustration-example.svg) and its phone copy [illustration-example.phone.svg](illustration-example.phone.svg): two threads taking turns on the GIL. Copy the skeleton (marker, title row, lanes, takeaway box) and change the content.

## The rules the content check enforces

`checkIllustration` in `src/mdx/illustration-svg.ts` is the source of truth; its errors say what to fix.

- A `viewBox` on `<svg>`, e.g. `viewBox="0 0 640 280"`. Its width is the drawn width in px: 640 fills the reading column.
- Colours only as attributes naming a site token: `fill="var(--ink)"`, `stroke="var(--rule)"`, or `none`. Never a hex or colour name, never `style` or `<style>`. The tokens:
  - neutrals: `paper` (the page), `paper-deep` (a faint track or panel), `ink` (text), `ink-soft` (secondary text, arrows), `rule` (axes, dividers);
  - accent: `accent` with `accent-wash` behind it, for the one thing the picture is about; `on-accent` for text on any filled shape;
  - series: `series-1` to `series-4`, for things drawn side by side (thread A, thread B…). More than four: grey the rest with `ink-soft`, or split the picture.
- No font: leave `font-family` out, so the site's face draws the Chinese.
- Every `<text>` at `font-size="13"` or more (set it once on `<svg>` and override where needed). Text stays text: never convert it to paths.
- Nothing that runs or loads: no `<script>`, `<style>`, `<image>`, `<foreignObject>`, `<a>`, `on…` attributes or outside links. `href` may only point inside the file (`#arrow`).
- **Phone copy.** When the labels would drop below 13px on a phone's 343px column (roughly: wider than 343 × your smallest font size ÷ 13), draw an upright copy next to it, `<name>.phone.svg`, that fits; phones show it instead. Turn the picture, don't shrink it: a timeline that runs across becomes one that runs down.

## House style

The covers vary per Post; Illustrations share one look, so a Reader recognises them.

- Flat shapes, `rx="6"` corners, `stroke-width="1.5"` lines, one arrowhead marker. No shadows, gradients, textures or icons.
- Labels in Traditional Chinese, short; code names (`GIL`, `Lock`) stay in English. A one-line title at the top in `font-size="16" font-weight="600"`.
- One takeaway, in the `accent-wash` box at the bottom or marked in `accent`, saying what to notice.
- Lay out on a grid with even gaps and at least 16px of margin; align labels to the shapes they name.

## Referencing it

`![兩條執行緒輪流取得 GIL 的時間軸](./gil.svg)` on its own line, with Chinese alt text saying what the picture shows; the phone copy needs no reference. The site inlines it, so it follows the theme and opens in the Lightbox.

## Checking it

Step 7's page shots show every Illustration in both themes at both widths. Read each one: nothing overlaps or runs off its shape, arrows land where they point, and the takeaway reads at a glance.
