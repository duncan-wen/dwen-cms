import { generateCover } from "@/cover/cover";

type Props = { slug: string; className?: string };

/**
 * A Post's generated cover: contour lines in the accent colour on deep paper.
 * It fills whatever box `className` gives it (set an aspect ratio there), cropping
 * rather than stretching, and recolours with the theme through CSS alone.
 */
export function PostCover({ slug, className = "" }: Props) {
  const { width, height, contours } = generateCover(slug);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={`block w-full bg-paper-deep text-accent ${className}`}
    >
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        {contours.map(({ d, heavy }, i) => (
          <path
            key={i}
            d={d}
            strokeOpacity={heavy ? 0.85 : 0.38}
            strokeWidth={heavy ? 1.6 : 0.9}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
