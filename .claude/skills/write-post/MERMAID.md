# Mermaid diagrams

Draw processes and architecture in a ```` ```mermaid ```` block; the site draws it as an SVG in its own colours, following the theme. The content check parses and draws each block (`checkDiagrams` in `src/content/content.ts`):

- Diagram types the site draws are `DRAWN_DIAGRAM_TYPES` in `src/mdx/parse-mermaid.ts`: flowchart, state, sequence, class, ER and xychart.
- Flowchart node IDs are ASCII, labels Chinese: `review{審閱}`, `write[撰寫文章]`. Name a node for what it is in the Post (`tone`, `review`): Mermaid keeps `style`, `end`, `class` and `graph` for itself (rule `mermaid-keyword-id`).
- An architecture diagram is a flowchart with `subgraph`s (`architecture-beta` isn't drawn).
- A sideways (`LR`) flowchart is drawn top-down on phones and when wider than the reading column, so both directions must read well. Keep labels short.
- Every diagram fits a phone's column as a phone draws it (rule `mermaid-phone-width`): give each level at most two side-by-side nodes. A decision with more outcomes reads better as numbered questions in prose.
- Edges flow one way (rule `mermaid-two-way-edges`): a node sending work to several nodes gets their returns at a new node below them, e.g. `coder -->|交付| qa[驗證把關]`.

The two flowcharts in the typography sample are working models.
