/**
 * The Mermaid diagram types the site draws (mermaidSvg's renderer), as
 * Mermaid's parser names them.
 */
export const DRAWN_DIAGRAM_TYPES = new Set([
  "flowchart-v2",
  "stateDiagram",
  "sequence",
  "classDiagram",
  "er",
  "xychart",
]);

let mermaidModule: Promise<typeof import("mermaid").default> | undefined;

/**
 * Parses Mermaid source with Mermaid's own parser, the reference grammar.
 * Returns the diagram type, e.g. `flowchart-v2`; throws a parse error.
 * Kept apart from mermaidSvg, whose renderer is ESM-only, so the content
 * check can run while next.config loads.
 */
export async function parseMermaid(source: string): Promise<string> {
  const mermaid = await loadMermaid();
  return (await mermaid.parse(source)).diagramType;
}

/**
 * Mermaid is large, so it loads on the first diagram. It sanitises labels
 * with DOMPurify, which needs a DOM: jsdom provides `window` while Mermaid
 * loads, DOMPurify keeps that one, and `window` is removed straight after.
 */
function loadMermaid() {
  mermaidModule ??= (async () => {
    const { JSDOM } = await import("jsdom");
    const global = globalThis as { window?: unknown };
    const hadWindow = "window" in global;
    if (!hadWindow) global.window = new JSDOM("").window;
    try {
      return (await import("mermaid")).default;
    } finally {
      if (!hadWindow) delete global.window;
    }
  })();
  return mermaidModule;
}
