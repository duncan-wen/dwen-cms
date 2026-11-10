import type { CSSProperties } from "react";
import { BODY_COLUMN_PX } from "../body-column";
import { DiagramLightbox } from "./lightbox";
import { diagramMinWidth as minWidth, mermaidSvg, topDownFlowchart } from "./mermaid-svg";

type Props = { chart: string; id: string };

/**
 * A ```mermaid block in a Post body, drawn as an SVG at build time. compileMdx
 * turns each block into this component, numbering `id` per body. A sideways
 * flowchart also gets a top-down copy: a phone always shows that, and so does a
 * desktop when the sideways one is too wide for the column. A diagram wider than the reading column shrinks to fit it, but never so
 * far that its labels drop below the body's small text; wider than that it scrolls
 * inside its own box. It opens in a Lightbox, fitted to the screen.
 */
export function Mermaid({ chart, id }: Props) {
  const svg = mermaidSvg(chart, id);
  const topDown = topDownFlowchart(chart);
  if (!topDown) return <Diagram svg={svg} id={id} />;
  const phoneId = `${id}-phone`;
  const topDownSvg = mermaidSvg(topDown, phoneId);
  if (minWidth(svg) > BODY_COLUMN_PX) return <Diagram svg={topDownSvg} id={phoneId} />;
  return (
    <>
      <Diagram svg={svg} id={id} className="max-sm:hidden" />
      <Diagram svg={topDownSvg} id={phoneId} className="sm:hidden" />
    </>
  );
}

/** How far the Lightbox may enlarge a Diagram beyond its drawn size, so a small one isn't blown up. */
const MAX_ENLARGEMENT = 2;

type DiagramProps = { svg: string; id: string; className?: string };

/** One drawing of a diagram, which opens in a Lightbox. */
function Diagram({ svg, id, className = "" }: DiagramProps) {
  const [width, height] = drawnSize(svg);
  // The enlarged copy sits in the page beside the drawing, so its ids get their own prefix.
  const enlargedSvg = svg
    .replaceAll(`id="${id}-`, `id="${id}-enlarged-`)
    .replaceAll(`url(#${id}-`, `url(#${id}-enlarged-`);
  return (
    <figure
      className={`mermaid-diagram not-prose my-8 ${className}`}
      style={{ "--diagram-min-width": `${minWidth(svg)}px` } as CSSProperties}
    >
      <DiagramLightbox
        scrollClassName="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full [&_svg]:min-w-(--diagram-min-width)"
        enlarged={
          <span
            className="mermaid-diagram block h-full w-full [&>svg]:h-full [&>svg]:w-full"
            style={{ maxWidth: width * MAX_ENLARGEMENT, maxHeight: height * MAX_ENLARGEMENT }}
            dangerouslySetInnerHTML={{ __html: enlargedSvg }}
          />
        }
      >
        <span className="contents" dangerouslySetInnerHTML={{ __html: svg }} />
      </DiagramLightbox>
    </figure>
  );
}

/** The width and height mermaidSvg's renderer draws a diagram at, in px. */
function drawnSize(svg: string): [number, number] {
  const attribute = (name: string) => Number(svg.match(new RegExp(`^<svg[^>]*\\s${name}="([\\d.]+)"`))?.[1] ?? 0);
  return [attribute("width"), attribute("height")];
}
