import type { Post } from "@/content/content";
import type { BodyImageSource } from "@/mdx/compile-mdx";

/** Where a file stored next to a Post is served: `/posts/<slug>/<file>`. */
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
