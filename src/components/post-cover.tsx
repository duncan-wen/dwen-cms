type Props = { slug: string; className?: string };

/**
 * A Post's generated cover: contour lines in the accent colour on deep paper.
 * The lines come from `/covers/<slug>.svg`, used as a mask over an accent fill, so
 * the page carries only a URL and the cover recolours with the theme through CSS alone.
 * It fills whatever box `className` gives it (set an aspect ratio there), cropping
 * rather than stretching.
 */
export function PostCover({ slug, className = "" }: Props) {
  return (
    <div aria-hidden="true" className={`relative block w-full overflow-hidden bg-paper-deep ${className}`}>
      <div
        className="absolute inset-0 bg-accent mask-cover mask-center mask-no-repeat"
        style={{ maskImage: `url(/covers/${slug}.svg)` }}
      />
    </div>
  );
}
