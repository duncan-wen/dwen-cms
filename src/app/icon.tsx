import { ImageResponse } from "next/og";
import { ImageSeal, sealFont } from "@/og/image-seal";
import { lightColours } from "@/og/token-colours";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The favicon: the 「溫」 seal, in the light theme's colours. */
export default async function Icon() {
  return new ImageResponse(<ImageSeal size={size.width} colours={await lightColours()} glyphScale={0.72} />, {
    ...size,
    fonts: [await sealFont()],
  });
}
