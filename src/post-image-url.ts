import type { Post } from "@/content/content";
import type { BodyImageSource, SlideDeckSource } from "@/mdx/compile-mdx";

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

/** Where an image stored next to a Post is served: `/posts/<slug>/<file>`. */
export function postImageUrl(slug: string, file: string): string {
  return `/posts/${slug}/${file.split("/").map(encodeURIComponent).join("/")}`;
}

/** A Post's body images as compileMdx takes them: each reference, with where it is served and its size. */
export function bodyImageSources({ slug, images }: Pick<Post, "slug" | "images">) {
  return Object.fromEntries(
    Object.entries(images).map(([ref, { file, width, height, illustration }]): [string, BodyImageSource] => [
      ref,
      illustration
        ? {
            src: postImageUrl(slug, file),
            width,
            height,
            svg: illustration.svg,
            minWidth: illustration.minWidth,
            phoneSvg: illustration.phone?.svg,
          }
        : { src: postImageUrl(slug, file), width, height },
    ]),
  );
}
