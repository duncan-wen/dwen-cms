import type { PostImageFile } from "@/content/content";
import { CoverLines } from "./cover-lines";

type Props = {
  /** The Post's Slug, which seeds its generated cover. */
  slug: string;
  /** The Post's cover image, when it has one. */
  image: PostImageFile | undefined;
};

/**
 * The Post's cover filling a promo image behind its paper panel: its cover image when it
 * has one, else its generated contour cover, as `PostCover` chooses on the site. The image
 * is inlined, because the promo document is set into the page without a server.
 */
export function PromoCover({ slug, image }: Props) {
  if (!image) return <CoverLines slug={slug} />;
  const src = `data:${image.type};base64,${Buffer.from(image.bytes).toString("base64")}`;
  // A screenshot document for Playwright, not a page: next/image has no server here to optimise through.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cover" src={src} alt="" />;
}
