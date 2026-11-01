import type { Post } from "@/content/content";
import { TITLE_TRACKING_EM, titleFontSize } from "./title-size";

type Props = {
  post: Pick<Post, "title" | "promo">;
  /** The width the title's lines fit in, in pixels. */
  width: number;
};

/** The title's size when nothing has to shrink. */
const BASE_SIZE = 64;

/** The glyphs a Post's title draws: its title lines when it has them, else its title. */
export function titleGlyphs({ title, promo }: Pick<Post, "title" | "promo">): string {
  return promo.titleLines?.join("") ?? title;
}

/**
 * A Post's title in its OG image: broken where its `promo.titleLines` breaks it,
 * the same lines its promo images show, each kept on one line and the whole title shrunk
 * until the longest fits; without them, the title wraps at `width`.
 */
export function OgTitle({ post: { title, promo }, width }: Props) {
  const lines = promo.titleLines;
  const fontSize = lines ? titleFontSize(lines, width, BASE_SIZE) : BASE_SIZE;
  const style = { fontSize, fontWeight: 700, lineHeight: 1.35, letterSpacing: `${TITLE_TRACKING_EM}em` } as const;
  if (!lines) return <div style={style}>{title}</div>;
  return (
    <div style={{ ...style, display: "flex", flexDirection: "column" }}>
      {lines.map((line, index) => (
        <div key={index} style={{ whiteSpace: "nowrap" }}>
          {line}
        </div>
      ))}
    </div>
  );
}
