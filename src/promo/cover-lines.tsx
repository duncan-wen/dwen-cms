import { generateCover } from "@/cover/cover";

type Props = {
  /** The Post's Slug, which seeds its generated cover. */
  slug: string;
};

/** The Post's generated contour cover, filling a promo image behind its paper panel. */
export function CoverLines({ slug }: Props) {
  const { width, height, contours } = generateCover(slug);
  return (
    <svg className="cover" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
      <g fill="none" style={{ stroke: "var(--accent)" }} strokeLinejoin="round">
        {contours.map(({ d, heavy }) => (
          <path
            key={d}
            d={d}
            strokeOpacity={heavy ? 0.85 : 0.38}
            strokeWidth={heavy ? 2.2 : 1.1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
