import type { Post } from "@/content/content";
import type { SlideDeckSource } from "@/mdx/compile-mdx";
import { postImageUrl } from "@/post-image-url";

/** A Post's Slide deck as compileMdx takes it: each slide, thumbnail and the PDF where they're served. */
export function slideDeckSource({ slug, deck }: Pick<Post, "slug" | "deck">): SlideDeckSource | undefined {
  if (!deck) return undefined;
  return {
    width: deck.width,
    height: deck.height,
    slides: deck.slides.map(({ image, thumb, title, text }) => ({
      src: postImageUrl(slug, image),
      thumb: postImageUrl(slug, thumb),
      title,
      text,
    })),
    pdf: { src: postImageUrl(slug, deck.pdf.file), size: fileSize(deck.pdf.bytes) },
  };
}

/** A file's size as a Reader reads it: `1.6 MB`, or `420 KB` under a megabyte. */
function fileSize(bytes: number): string {
  return bytes < 1e6 ? `${Math.max(1, Math.round(bytes / 1e3))} KB` : `${(bytes / 1e6).toFixed(1)} MB`;
}
