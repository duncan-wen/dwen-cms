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

/** Words Mermaid's flowchart grammar keeps for itself, so its parser rejects one written as a node ID. */
const FLOWCHART_KEYWORDS = [
  "style",
  "end",
  "class",
  "classDef",
  "click",
  "graph",
  "subgraph",
  "linkStyle",
  "interpolate",
  "call",
  "href",
];
/** A keyword where a node ID goes: at the start of a statement or after an arrow, with a shape or an arrow next. */
const KEYWORD_NODE_ID = new RegExp(
  String.raw`(?:^|[\s;&>|-])(${FLOWCHART_KEYWORDS.join("|")})[ \t]*(?:[\[({]|-[-.]|==)`,
  "m",
);

/**
 * The Mermaid keyword a flowchart's source uses as a node ID, e.g. `style` in
 * `a --> style[畫風]`; undefined when it uses none. Mermaid's own parse error
 * for one names only a line, so the content check asks this once parsing fails.
 */
export function keywordNodeId(source: string): string | undefined {
  return KEYWORD_NODE_ID.exec(source)?.[1];
}

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
