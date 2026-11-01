import Image from "next/image";
import type { Post } from "@/content/content";
import { postImageUrl } from "@/post-image-url";

type Props = {
  post: Pick<Post, "slug" | "cover">;
  className?: string;
  /** The cover image's rendered width, for next/image to pick a size: an `img` sizes value. */
  sizes: string;
  /** Load the cover image first, for a cover at the top of the page. */
  preload?: boolean;
};

/**
 * A Post's cover: its cover image when it has one, else its generated cover, contour
 * lines in the accent colour on deep paper. The lines come from `/covers/<slug>.svg`,
 * used as a mask over an accent fill, so the page carries only a URL and the cover
 * recolours with the theme through CSS alone. Either fills whatever box `className`
 * gives it (set an aspect ratio there), cropping rather than stretching.
 */
export function PostCover({ post: { slug, cover }, className = "", sizes, preload }: Props) {
  if (cover) {
    return (
      <div className={`relative block w-full overflow-hidden bg-paper-deep ${className}`}>
        <Image
          src={postImageUrl(slug, cover.file)}
          alt=""
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={`relative block w-full overflow-hidden bg-paper-deep ${className}`}>
      <div
        className="absolute inset-0 bg-accent mask-cover mask-center mask-no-repeat"
        style={{ maskImage: `url(/covers/${slug}.svg)` }}
      />
    </div>
  );
}
