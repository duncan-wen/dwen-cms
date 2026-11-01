import type { LightColours } from "./light-colours";
import { serifFont } from "./serif-font";

/** The glyph the seal bears. */
const SEAL_GLYPH = "溫";

type Props = {
  /** The seal's width and height in pixels. */
  size: number;
  colours: Pick<LightColours, "accent" | "on-accent">;
  /** The glyph's size as a share of the seal's; the favicon sets it larger so it reads at 16px. */
  glyphScale?: number;
};

/**
 * The 「溫」 seal for images drawn at build time (the OG images and the icon), which
 * can't use the `Seal` component's CSS. Same proportions as `Seal`: an accent square,
 * corners rounded by a tenth of its size, the glyph in the serif face's black weight.
 * The image needs `sealFont()` among its fonts.
 */
export function ImageSeal({ size, colours, glyphScale = 0.64 }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.095),
        background: colours.accent,
        color: colours["on-accent"],
        fontFamily: "Noto Serif TC",
        fontSize: Math.round(size * glyphScale),
        fontWeight: 900,
      }}
    >
      {SEAL_GLYPH}
    </div>
  );
}

/** The font ImageSeal draws its glyph with. */
export function sealFont() {
  return serifFont(900, SEAL_GLYPH);
}
