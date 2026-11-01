import Image from "next/image";
import { bodyColumnSizes } from "../body-column";

type Props = { src?: string; alt?: string; width?: number | string; height?: number | string };

/**
 * A Markdown image in a body, optimised by next/image. compileMdx gives it the
 * image's URL and dimensions, so the browser reserves its box and nothing shifts.
 */
export function BodyImage({ src, alt = "", width, height }: Props) {
  if (!src || width === undefined || height === undefined) {
    throw new Error(`The image "${src}" has no known dimensions; store it next to the Post`);
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={Number(width)}
      height={Number(height)}
      sizes={bodyColumnSizes}
      className="h-auto max-w-full rounded-md"
    />
  );
}
