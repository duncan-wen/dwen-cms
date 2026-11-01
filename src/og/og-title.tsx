import type { Post } from "@/content/content";
import { titleFontSize } from "./title-size";

type Props = {
  post: Pick<Post, "title" | "promo">;
  /** The width the title's lines fit in, in pixels. */
  width: number;
};

/** The title's size when nothing has to shrink. */
const BASE_SIZE = 64;

/**
 * A Post's title in a build-time image: broken where its `promo.titleLines` breaks it,
 * the same lines its promo images show, each kept on one line and the whole title shrunk
 * until the longest fits; without them, the title wraps at `width`.
 */
export function OgTitle({ post: { title, promo }, width }: Props) {
  const lines = promo.titleLines;
  const fontSize = lines ? titleFontSize(lines, width, BASE_SIZE) : BASE_SIZE;
  const style = { fontSize, fontWeight: 700, lineHeight: 1.35, letterSpacing: "0.02em" } as const;
  if (!lines) return <div style={style}>{title}</div>;
  return (
    <div style={{ ...style, display: "flex", flexDirection: "column" }}>
      {lines.map((line) => (
        <div key={line} style={{ whiteSpace: "nowrap" }}>
          {line}
        </div>
      ))}
    </div>
  );
}
