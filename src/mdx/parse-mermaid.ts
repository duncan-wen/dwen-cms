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

/** Words Mermaid's flowchart grammar reads as something other than a node ID wherever a statement allows one. */
const FLOWCHART_KEYWORDS = [
  "style",
  "end",
  "class",
  "classDef",
  "click",
  "call",
  "href",
  "graph",
  "subgraph",
  "flowchart",
  "linkStyle",
  "interpolate",
  "default",
];

/**
 * The Mermaid keyword a flowchart that doesn't parse uses as a node ID, e.g.
 * `style` in `a --> style[畫風]`; undefined when no keyword is to blame.
 * Mermaid's own error for one names only a line. A keyword is to blame when
 * the flowchart parses once that word alone is spelled differently below the
 * first line, so a keyword in a label or beside another mistake is never named.
 */
export async function keywordNodeId(source: string): Promise<string | undefined> {
  const [header, ...rest] = source.trimStart().split("\n");
  if (!/^(flowchart|graph)\b/.test(header)) return undefined;
  const body = rest.join("\n");
  for (const keyword of FLOWCHART_KEYWORDS) {
    const word = new RegExp(String.raw`(?<![\w-])${keyword}(?![\w-])`, "g");
    if (!word.test(body)) continue;
    const renamed = `${header}\n${body.replace(word, `${keyword}Node`)}`;
    if (await parses(renamed)) return keyword;
  }
  return undefined;
}

async function parses(source: string): Promise<boolean> {
  try {
    await parseMermaid(source);
    return true;
  } catch {
    return false;
  }
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
