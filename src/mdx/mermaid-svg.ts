import { renderMermaidSVG } from "beautiful-mermaid";

/**
 * Diagram colours are the site's colour tokens, so the SVG follows the theme
 * through the CSS cascade: the toggle switches it without re-rendering.
 */
const tokenColours = {
  bg: "var(--paper)",
  fg: "var(--ink)",
  line: "var(--ink-soft)",
  accent: "var(--accent)",
  muted: "var(--ink-soft)",
  surface: "var(--accent-wash)",
  border: "var(--accent)",
};

/**
 * Renders Mermaid source to an inline SVG string in Node, with no browser
 * (beautiful-mermaid; Vercel's build has none). `idPrefix` keeps the SVG's ids
 * unique when a page holds several diagrams. Throws on a diagram type the
 * renderer doesn't support; the content check reports that as a problem.
 */
export function mermaidSvg(source: string, idPrefix: string): string {
  // The figure's margin spaces it from the prose, so the canvas needs little padding of its own.
  const svg = renderMermaidSVG(source, { ...tokenColours, transparent: true, padding: 8 });
  return (
    svg
      // The renderer @imports a web font and sets one on every <text> on the page;
      // globals.css sets the diagram font instead, so Traditional Chinese renders.
      .replace(/^\s*@import url\([^)]*\);\n/gm, "")
      .replace(/^\s*text \{ font-family:[^}]*\}\n/m, "")
      .replace(/(\s)id="([^"]*)"/g, `$1id="${idPrefix}-$2"`)
      .replace(/url\(#([^)]*)\)/g, `url(#${idPrefix}-$1)`)
      .replace(/(<polyline class="edge"[^>]*points=")([^"]*)"/g, (_, head, points) => `${head}${straighten(points)}"`)
  );
}

/** The size mermaidSvg's renderer sets node labels at, in px, when the diagram isn't scaled. */
const NODE_LABEL_PX = 13;

/** The body's small text (dates, meta lines), in px: the smallest a node label may shrink to. */
const SMALL_TEXT_PX = 13;

/** The least a diagram is scaled to fit the column. */
const MIN_SCALE = SMALL_TEXT_PX / NODE_LABEL_PX;

/** The narrowest a drawn diagram (mermaidSvg's output) may be, in px, before its labels drop below the body's small text. */
export function diagramMinWidth(svg: string): number {
  return Number(svg.match(/^<svg[^>]*\swidth="([\d.]+)"/)?.[1] ?? 0) * MIN_SCALE;
}

/** A sideways step in an edge shorter than this, in px, reads as a flaw, not a turn. */
const JOG_PX = 6;

/**
 * An edge's points without the renderer's jogs: where a line steps aside by a
 * few px and carries on in the same direction, the rest of the line is moved
 * back in line with what came before, so it runs straight. Repeated and
 * collinear points are dropped.
 */
function straighten(points: string): string {
  let line = points.split(" ").map((pair) => pair.split(",").map(Number) as [number, number]);
  for (let i = 1; i < line.length; i++) {
    const [x, y] = line[i];
    const [px, py] = line[i - 1];
    const dx = x - px;
    const dy = y - py;
    if (Math.hypot(dx, dy) >= JOG_PX) continue;
    // Shift everything after the jog back by the step it took.
    line = line.map((point, j) => (j < i ? point : [point[0] - dx, point[1] - dy]));
  }
  const kept = line.filter((point, i) => {
    const prev = line[i - 1];
    const next = line[i + 1];
    if (!prev || !next) return true;
    const same = point[0] === prev[0] && point[1] === prev[1];
    const collinear = (prev[0] === point[0] && point[0] === next[0]) || (prev[1] === point[1] && point[1] === next[1]);
    return !same && !collinear;
  });
  return kept.map(([x, y]) => `${x},${y}`).join(" ");
}

/** A flowchart header that reads sideways, with its keyword and direction. */
const SIDEWAYS_HEADER = /^(\s*(?:flowchart|graph))\s+(?:LR|RL)\b/;

/**
 * The same flowchart drawn top-down, for a phone, when the source draws it
 * sideways (LR or RL), including any `direction` inside its subgraphs.
 * Undefined when it already reads top-down or isn't a flowchart.
 */
export function topDownFlowchart(source: string): string | undefined {
  if (!SIDEWAYS_HEADER.test(source)) return undefined;
  return source
    .replace(SIDEWAYS_HEADER, "$1 TB")
    .replace(/^(\s*direction)\s+(?:LR|RL)\b/gm, "$1 TB");
}
