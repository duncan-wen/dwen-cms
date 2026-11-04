import Image from "next/image";
import { bodyColumnSizes } from "../body-column";
import { Lightbox } from "./lightbox";

type Props = { src?: string; alt?: string; width?: number | string; height?: number | string };

/**
 * A Markdown image in a body, optimised by next/image, that opens in a Lightbox. compileMdx
 * gives it the image's URL and dimensions, so the browser reserves its box and nothing shifts.
 */
export function BodyImage({ src, alt = "", width, height }: Props) {
  if (!src || width === undefined || height === undefined) {
    throw new Error(`The image "${src}" has no known dimensions; store it next to the Post`);
  }
  const size = { width: Number(width), height: Number(height) };
  return (
    <Lightbox src={src} alt={alt} {...size}>
      <Image
        src={src}
        alt={alt}
        {...size}
        sizes={bodyColumnSizes}
        className="h-auto max-w-full rounded-md dark:brightness-[.85]"
      />
    </Lightbox>
  );
}
