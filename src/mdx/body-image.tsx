import Image from "next/image";
import type { CSSProperties } from "react";
import { bodyColumnSizes } from "../body-column";
import { illustrationSvg } from "./illustration-svg";
import { Lightbox } from "./lightbox";

type Props = {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** An Illustration's SVG source, which is inlined instead of loaded. */
  svg?: string;
  /** The narrowest an Illustration may be drawn, in px. */
  minWidth?: number | string;
  /** An Illustration's upright phone copy, which phones show instead. */
  phoneSvg?: string;
  /** Unique per body, so the ids inside each inlined Illustration don't collide. */
  illustrationId?: string;
};

/**
 * A Markdown image in a body, optimised by next/image, that opens in a Lightbox. compileMdx
 * gives it the image's URL and dimensions, so the browser reserves its box and nothing shifts.
 * An Illustration is inlined instead, so its colour tokens follow the theme.
 */
export function BodyImage({ src, alt = "", width, height, svg, minWidth, phoneSvg, illustrationId }: Props) {
  if (!src || width === undefined || height === undefined) {
    throw new Error(`The image "${src}" has no known dimensions; store it next to the Post`);
  }
  if (svg !== undefined) {
    const id = illustrationId ?? "illustration";
    return (
      <Lightbox
        src={src}
        alt={alt}
        enlarged={
          <Drawings svg={svg} phoneSvg={phoneSvg} id={`${id}-enlarged`} alt={alt} className="h-full w-full [&>svg]:h-full [&>svg]:w-full" />
        }
      >
        <Drawings
          svg={svg}
          phoneSvg={phoneSvg}
          id={id}
          alt={alt}
          // A last resort: the content check makes sure each drawing fits where it shows.
          className="max-w-full overflow-x-auto [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:min-w-(--illustration-min-width)"
          style={{ "--illustration-min-width": `${Number(minWidth ?? 0)}px` } as CSSProperties}
        />
      </Lightbox>
    );
  }
  const size = { width: Number(width), height: Number(height) };
  const image = (className: string, optimised: boolean) => (
    <Image
      unoptimized={!optimised}
      src={src}
      alt={alt}
      {...size}
      sizes={optimised ? bodyColumnSizes : undefined}
      className={`${className} rounded-md dark:brightness-[.85]`}
    />
  );
  return (
    <Lightbox src={src} alt={alt} enlarged={image("h-auto max-h-full w-auto max-w-full", false)}>
      {image("h-auto max-w-full", true)}
    </Lightbox>
  );
}

type DrawingsProps = {
  svg: string;
  phoneSvg: string | undefined;
  id: string;
  alt: string;
  className: string;
  style?: CSSProperties;
};

/** An Illustration inlined, or, when it has a phone copy, both: each showing only at its own width. */
function Drawings({ svg, phoneSvg, id, alt, className, style }: DrawingsProps) {
  const drawing = (source: string, prefix: string, extra = "", ownStyle = style) => (
    <span
      role="img"
      aria-label={alt}
      className={`illustration block ${className} ${extra}`}
      style={ownStyle}
      dangerouslySetInnerHTML={{ __html: illustrationSvg(source, prefix) }}
    />
  );
  if (phoneSvg === undefined) return drawing(svg, id);
  return (
    <>
      {drawing(svg, id, "max-sm:hidden")}
      {/* The phone copy fits a phone's column by the content check, so it needs no minimum width. */}
      {drawing(phoneSvg, `${id}-phone`, "sm:hidden", { ...style, "--illustration-min-width": "0px" } as CSSProperties)}
    </>
  );
}
