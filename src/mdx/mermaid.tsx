import { mermaidSvg } from "./mermaid-svg";

type Props = { chart: string; id: string };

/**
 * A ```mermaid block in a Post body, drawn as an SVG at build time. compileMdx
 * turns each block into this component, numbering `id` per body. A diagram wider
 * than the reading column shrinks to fit it from the sm breakpoint up; on a phone,
 * where shrinking would make its text unreadable, it scrolls inside its own box.
 */
export function Mermaid({ chart, id }: Props) {
  return (
    <figure
      className="mermaid-diagram not-prose my-8 overflow-x-auto [&>svg]:mx-auto [&>svg]:max-w-none sm:[&>svg]:h-auto sm:[&>svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: mermaidSvg(chart, id) }}
    />
  );
}
