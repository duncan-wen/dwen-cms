/**
 * The Mermaid diagram types the site draws (mermaidSvg's renderer), keyed as
 * Mermaid's parser names them, each with the name a writer knows it by.
 */
export const DRAWN_DIAGRAM_TYPES = new Map([
  ["flowchart-v2", "flowchart"],
  ["stateDiagram", "state"],
  ["sequence", "sequence"],
  ["classDiagram", "class"],
  ["er", "ER"],
  ["xychart", "xychart"],
]);

/** What Mermaid's parser reads from a diagram. */
export type ParsedMermaid = {
  /** The diagram type, e.g. `flowchart-v2`. */
  diagramType: string;
  /** A flowchart's node IDs, as the source writes them; empty for other types. */
  nodeIds: string[];
  /** A flowchart's edges, each as the IDs of the nodes it runs from and to; empty for other types. */
  edges: [from: string, to: string][];
};

let mermaidModule: Promise<typeof import("mermaid").default> | undefined;

/**
 * Parses Mermaid source with Mermaid's own parser, the reference grammar;
 * throws a parse error. The content check runs it before mermaidSvg's
 * renderer, which reads less of Mermaid's grammar and gives vaguer errors.
 */
export async function parseMermaid(source: string): Promise<ParsedMermaid> {
  const mermaid = await loadMermaid();
  const { diagramType } = await mermaid.parse(source);
  if (diagramType !== "flowchart-v2") return { diagramType, nodeIds: [], edges: [] };
  const { db } = await mermaid.mermaidAPI.getDiagramFromText(source);
  const flowchart = db as {
    getVertices(): Map<string, unknown>;
    getEdges(): { start: string; end: string }[];
  };
  return {
    diagramType,
    nodeIds: [...flowchart.getVertices().keys()],
    edges: flowchart.getEdges().map(({ start, end }) => [start, end]),
  };
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
