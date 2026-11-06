import { readFile } from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

const FILES = { 700: "NotoSerifTC-Bold.ttf", 900: "NotoSerifTC-Black.ttf" } as const;

/**
 * Noto Serif TC, the site's heading and seal face, for images drawn at build time
 * (the OG images and the icon). Their renderer needs the font file itself and can't
 * read WOFF2, so this cuts a TrueType file holding only the glyphs in `text` from the
 * full face in src/og/fonts: a few kilobytes instead of the full Traditional Chinese set.
 * The faces are committed, so the build doesn't depend on reaching Google Fonts.
 */
export async function serifFont(weight: 700 | 900, text: string) {
  const full = await readFile(
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src/og/fonts", FILES[weight]),
  );
  const subset = await subsetFont(full, text, { targetFormat: "truetype" });
  return {
    name: "Noto Serif TC",
    data: subset.buffer.slice(subset.byteOffset, subset.byteOffset + subset.byteLength) as ArrayBuffer,
    weight,
    style: "normal" as const,
  };
}
