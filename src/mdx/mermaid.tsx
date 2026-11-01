import type { CSSProperties } from "react";
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
 * flowchart is drawn twice, and a phone shows the top-down copy so it fits the
 * column. A diagram wider than the reading column shrinks to fit it, but never so
 * far that its labels drop below the body's small text; wider than that it scrolls
 * inside its own box.
 */
export function Mermaid({ chart, id }: Props) {
  const topDown = topDownFlowchart(chart);
  if (!topDown) return <Diagram svg={mermaidSvg(chart, id)} />;
  return (
    <>
      <Diagram svg={mermaidSvg(chart, id)} className="max-sm:hidden" />
      <Diagram svg={mermaidSvg(topDown, `${id}-phone`)} className="sm:hidden" />
    </>
  );
}

type DiagramProps = { svg: string; className?: string };

function Diagram({ svg, className = "" }: DiagramProps) {
  const width = Number(svg.match(/^<svg[^>]*\swidth="([\d.]+)"/)?.[1] ?? 0);
  const style = { "--diagram-min-width": `${width * MIN_SCALE}px` } as CSSProperties;
  return (
    <figure
      className={`mermaid-diagram not-prose my-8 overflow-x-auto [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:min-w-(--diagram-min-width) ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
