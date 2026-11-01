import type { CSSProperties } from "react";
import { BODY_COLUMN_PX } from "../body-column";
import { mermaidSvg, topDownFlowchart } from "./mermaid-svg";

type Props = { chart: string; id: string };

/** The size mermaidSvg's renderer sets node labels at, in px, when the diagram isn't scaled. */
const NODE_LABEL_PX = 13;

/** The body's small text (dates, meta lines), in px: the smallest a node label may shrink to. */
const SMALL_TEXT_PX = 13;

/** The least a diagram is scaled to fit the column. */
const MIN_SCALE = SMALL_TEXT_PX / NODE_LABEL_PX;

/**
 * A ```mermaid block in a Post body, drawn as an SVG at build time. compileMdx
 * turns each block into this component, numbering `id` per body. A sideways
 * flowchart also gets a top-down copy: a phone always shows that, and so does a
 * desktop when the sideways one is too wide for the column. A diagram wider than the reading column shrinks to fit it, but never so
 * far that its labels drop below the body's small text; wider than that it scrolls
 * inside its own box.
 */
export function Mermaid({ chart, id }: Props) {
  const svg = mermaidSvg(chart, id);
  const topDown = topDownFlowchart(chart);
  if (!topDown) return <Diagram svg={svg} />;
  const topDownSvg = mermaidSvg(topDown, `${id}-phone`);
  if (minWidth(svg) > BODY_COLUMN_PX) return <Diagram svg={topDownSvg} />;
  return (
    <>
      <Diagram svg={svg} className="max-sm:hidden" />
      <Diagram svg={topDownSvg} className="sm:hidden" />
    </>
  );
}

type DiagramProps = { svg: string; className?: string };

/** The narrowest a diagram may be drawn, in px, before its labels would drop below the body's small text. */
function minWidth(svg: string): number {
  return Number(svg.match(/^<svg[^>]*\swidth="([\d.]+)"/)?.[1] ?? 0) * MIN_SCALE;
}

function Diagram({ svg, className = "" }: DiagramProps) {
  const style = { "--diagram-min-width": `${minWidth(svg)}px` } as CSSProperties;
  return (
    <figure
      className={`mermaid-diagram not-prose my-8 overflow-x-auto [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:min-w-(--diagram-min-width) ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
